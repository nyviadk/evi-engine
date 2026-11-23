import { test } from "node:test";
import assert from "node:assert/strict";

// node:sqlite er indbygget i Node, men projektets @types/node kender det ikke endnu.
type Sqlite = {
  prepare(q: string): {
    all(...p: unknown[]): Record<string, unknown>[];
    get(...p: unknown[]): Record<string, unknown> | undefined;
    run(...p: unknown[]): unknown;
  };
  exec(q: string): void;
};
const { DatabaseSync } = process.getBuiltinModule("node:sqlite") as unknown as {
  DatabaseSync: new (path: string) => Sqlite;
};

import {
  SCHEMA,
  add_missing_columns,
  anonymize_day,
  classify_day,
  days_to_archive,
  store_day,
  to_archive_row,
  type DayRow,
} from "./archive";

test("døgnets besøgende mærkes, før besøgskoden slettes", () => {
  const row = (visitor: string, over: Partial<DayRow> = {}): DayRow => ({
    repo: "myplanio", ts: "2026-11-22 10:00:00", kind: "prod", visitor,
    referrer_host: "", from_path: "", asn: "3292", ...over,
  });
  const rows: DayRow[] = [
    // Menneske: kom via Google og klikkede videre.
    row("human", { referrer_host: "google.com" }),
    row("human", { from_path: "/" }),
    // Os selv: også set på staging.
    row("me"), row("me", { kind: "staging" }),
    // Flere sider uden et eneste klik.
    row("reload"), row("reload"),
    // Datacenter-netværk: ikke mærket (kan filtreres på ASN bagefter), men ikke menneske.
    row("cloud", { asn: "16509", referrer_host: "google.com" }),
    // Bølge: tre enkeltsidebesøg fra hver sit netværk på et minut.
    row("b1", { asn: "1", ts: "2026-11-22 03:23:01" }),
    row("b2", { asn: "2", ts: "2026-11-22 03:23:10" }),
    row("b3", { asn: "3", ts: "2026-11-22 03:23:20" }),
  ];
  const { excluded, visitors } = classify_day(rows);
  assert.equal(excluded.get("me"), "dev");
  assert.equal(excluded.get("reload"), "unclicked");
  assert.equal(excluded.get("b1"), "burst");
  assert.equal(excluded.has("human"), false);
  assert.equal(excluded.has("cloud"), false);
  assert.deepEqual(visitors.get("myplanio"), { all: 7, human: 1 });
});

const now = Date.parse("2026-11-23T10:00:00Z");

test("arkiverer kun hele døgn, til og med i går", () => {
  const days = days_to_archive(now, new Set());
  assert.equal(days.at(-1), "2026-11-22");
  assert.equal(days.length, 89);
});

test("springer arkiverede døgn over", () => {
  const days = days_to_archive(now, new Set(["2026-11-21", "2026-11-22"]));
  assert.equal(days.at(-1), "2026-11-20");
  assert.ok(!days.includes("2026-11-21"));
});

test("en række får dag, repo og alle felter i fast rækkefølge", () => {
  const row = to_archive_row({
    timestamp: "2026-11-22 20:44:08", repo: "myplanio", b1: "www.myplanio.com", b2: "prod",
    b3: "/da-dk", b4: "google.com", b5: "", b6: "DK", b7: "mobile", b8: "abc", b9: "da-dk",
    b10: "3292", b11: "TDC", si: 1,
  });
  assert.deepEqual(row, [
    "2026-11-22 20:44:08", "2026-11-22", "myplanio", "www.myplanio.com", "prod", "/da-dk",
    "google.com", "", "DK", "mobile", "abc", "da-dk", "3292", "TDC", 1,
  ]);
});

test("manglende samplingsfaktor tæller som 1", () => {
  assert.equal(to_archive_row({ timestamp: "2026-11-22 01:00:00" }).at(-1), 1);
});

// D1 er SQLite: kør arkivets rigtige SQL mod node:sqlite gennem en lille D1-lignende adapter.

type Params = (string | number | null)[];
function fake_d1(sql = new DatabaseSync(":memory:")) {
  const statement = (query: string, params: Params = []) => ({
    bind: (...p: Params) => statement(query, p),
    all: async () => ({ results: sql.prepare(query).all(...params) }),
    run: async () => sql.prepare(query).run(...params),
    exec: () => sql.prepare(query).run(...params),
  });
  const db = {
    prepare: (query: string) => statement(query),
    batch: async (list: ReturnType<typeof statement>[]) => {
      sql.exec("BEGIN");
      try {
        for (const s of list) s.exec();
        sql.exec("COMMIT");
      } catch (error) {
        sql.exec("ROLLBACK");
        throw error;
      }
      return [];
    },
  };
  return { db: db as unknown as D1Database, sql };
}

const ae_row = (visitor: string, ts: string, extra: Record<string, unknown> = {}) => ({
  timestamp: ts, repo: "myplanio", b1: "www.myplanio.com", b2: "prod", b3: "/da-dk", b4: "",
  b5: "", b6: "DK", b7: "desktop", b8: visitor, b9: "da-dk", b10: "3292", b11: "TDC", si: 1, ...extra,
});

test("arkivets SQL: skema, indsættelse i blokke og anonymisering i SQLite", async () => {
  const { db, sql } = fake_d1();
  await db.batch(SCHEMA.map((q) => db.prepare(q)));
  await add_missing_columns(db);
  // 8 rækker krydser blokgrænsen (6 pr. INSERT).
  const rows = [
    ae_row("human", "2025-11-20 10:00:00", { b4: "google.com" }),
    ae_row("human", "2025-11-20 10:01:00", { b5: "/da-dk" }),
    ae_row("reload", "2025-11-20 11:00:00"),
    ae_row("reload", "2025-11-20 11:00:30"),
    ae_row("x1", "2025-11-20 12:00:00", { b4: "linkedin.com" }),
    ae_row("x2", "2025-11-20 12:30:00", { b4: "linkedin.com" }),
    ae_row("x3", "2025-11-20 13:00:00", { b4: "linkedin.com" }),
    ae_row("me", "2025-11-20 14:00:00", { b1: "myplanio.nyvia.dk", b2: "staging" }),
  ];
  await store_day(db, "2025-11-20", rows);
  // Igen samme dag: erstatter, dublerer ikke.
  await store_day(db, "2025-11-20", rows);
  assert.equal(sql.prepare("SELECT count(*) AS n FROM pageviews").get()?.n, 8);
  assert.equal(sql.prepare("SELECT rows FROM archived_days WHERE day = '2025-11-20'").get()?.rows, 8);

  await anonymize_day(db, "2025-11-20");
  assert.equal(sql.prepare("SELECT count(*) AS n FROM pageviews WHERE visitor != ''").get()?.n, 0);
  assert.equal(sql.prepare("SELECT count(*) AS n FROM pageviews WHERE excluded = 'unclicked'").get()?.n, 2);
  assert.deepEqual(
    { ...sql.prepare("SELECT visitors, visitors_human FROM daily_visitors WHERE day = '2025-11-20' AND repo = 'myplanio'").get() },
    { visitors: 5, visitors_human: 4 },
  );
  assert.ok(sql.prepare("SELECT day FROM anonymized_days WHERE day = '2025-11-20'").get());
});

test("en ældre tabel uden excluded-kolonnen får den tilføjet", async () => {
  const { db, sql } = fake_d1();
  sql.exec("CREATE TABLE pageviews (ts TEXT, day TEXT, repo TEXT, visitor TEXT)");
  await add_missing_columns(db);
  const cols = sql.prepare("PRAGMA table_info(pageviews)").all().map((c) => c.name);
  assert.ok(cols.includes("excluded"));
});
