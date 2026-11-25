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
  classify_stored_day,
  days_to_archive,
  store_day,
  to_archive_row,
  type DayRow,
} from "./archive";
import { stats_from_archive, storage_status } from "./query";

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
  assert.deepEqual(visitors.get("myplanio"), { all: 7, human: 1, bot: 4 });
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
    first: async () => sql.prepare(query).get(...params) ?? null,
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
  // 9 rækker krydser blokgrænsen (6 pr. INSERT).
  const rows = [
    ae_row("human", "2026-11-20 10:00:00", { b4: "google.com" }),
    ae_row("human", "2026-11-20 10:01:00", { b5: "/da-dk" }),
    ae_row("reload", "2026-11-20 11:00:00"),
    ae_row("reload", "2026-11-20 11:00:30"),
    ae_row("x1", "2026-11-20 12:00:00", { b4: "linkedin.com" }),
    ae_row("x2", "2026-11-20 12:30:00", { b4: "linkedin.com" }),
    ae_row("x3", "2026-11-20 13:00:00", { b4: "linkedin.com" }),
    ae_row("me", "2026-11-20 14:00:00", { b1: "myplanio.nyvia.dk", b2: "staging" }),
    ae_row("me", "2026-11-20 14:05:00", { b4: "google.com" }),
  ];
  await store_day(db, "2026-11-20", rows);
  // Igen samme dag: erstatter, dublerer ikke.
  await store_day(db, "2026-11-20", rows);
  assert.equal(sql.prepare("SELECT count(*) AS n FROM pageviews").get()?.n, 9);
  assert.equal(sql.prepare("SELECT rows FROM archived_days WHERE day = '2026-11-20'").get()?.rows, 9);

  await classify_stored_day(db, "2026-11-20");
  // To gange: mærkningen erstattes, ikke dubleres.
  await classify_stored_day(db, "2026-11-20");
  assert.equal(sql.prepare("SELECT count(*) AS n FROM pageviews WHERE excluded = 'unclicked'").get()?.n, 2);
  // Begge "me"-rækker (staging + prod) får mærket.
  assert.equal(sql.prepare("SELECT count(*) AS n FROM pageviews WHERE excluded = 'dev'").get()?.n, 2);
  assert.deepEqual(
    { ...sql.prepare("SELECT visitors, visitors_human, visitors_bot FROM daily_visitors WHERE day = '2026-11-20' AND repo = 'myplanio'").get() },
    { visitors: 6, visitors_human: 4, visitors_bot: 1 },
  );
  assert.equal(sql.prepare("SELECT version FROM classified_days WHERE day = '2026-11-20'").get()?.version, 3);

  await anonymize_day(db, "2026-11-20");
  assert.equal(sql.prepare("SELECT count(*) AS n FROM pageviews WHERE visitor != ''").get()?.n, 0);
  // Mærkningen overlever, at koden slettes.
  assert.equal(sql.prepare("SELECT count(*) AS n FROM pageviews WHERE excluded = 'unclicked'").get()?.n, 2);
  assert.ok(sql.prepare("SELECT day FROM anonymized_days WHERE day = '2026-11-20'").get());

  // Arkiveres døgnet forfra, skal det mærkes igen.
  await store_day(db, "2026-11-20", rows);
  assert.equal(sql.prepare("SELECT count(*) AS n FROM classified_days").get()?.n, 0);
});

test("ældre tabeller får de nye kolonner tilføjet", async () => {
  const { db, sql } = fake_d1();
  sql.exec("CREATE TABLE pageviews (ts TEXT, day TEXT, repo TEXT, visitor TEXT)");
  sql.exec("CREATE TABLE daily_visitors (day TEXT, repo TEXT, visitors INTEGER, visitors_human INTEGER)");
  await add_missing_columns(db);
  const cols = (table: string) => sql.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  assert.ok(cols("pageviews").includes("excluded"));
  assert.ok(cols("daily_visitors").includes("visitors_bot"));
});

test("dashboardet læser arkivet: robotter, datacentre og staging tælles ikke", async () => {
  const { db } = fake_d1();
  await db.batch(SCHEMA.map((q) => db.prepare(q)));
  const day = "2026-11-20";
  await store_day(db, day, [
    ae_row("human", `${day} 10:00:00`, { b4: "google.com" }),
    ae_row("human", `${day} 10:01:00`, { b3: "/da-dk/om-os", b5: "/da-dk" }),
    ae_row("reload", `${day} 11:00:00`),
    ae_row("reload", `${day} 11:00:30`),
    ae_row("cloud", `${day} 12:00:00`, { b10: "16509", b11: "Amazon", b4: "google.com" }),
    ae_row("stage", `${day} 13:00:00`, { b1: "myplanio.nyvia.dk", b2: "staging" }),
  ]);
  await classify_stored_day(db, day);
  const stats = await stats_from_archive(db, "myplanio", 0, Date.parse("2026-11-23T08:00:00Z"));
  assert.equal(stats.archive, true);
  assert.equal(stats.views, 2);
  assert.equal(stats.visitors, 1);
  assert.equal(stats.bot_visitors, 1);
  assert.deepEqual(stats.referrers, [{ name: "google.com", count: 1 }]);
  assert.deepEqual(stats.flow, [{ from: "/da-dk", to: "/da-dk/om-os", count: 1 }]);
  assert.equal(stats.timeseries.at(-1)?.day, "2026-11-22");
  assert.equal(stats.timeseries.find((d) => d.day === day)?.views, 2);
  assert.equal(stats.journeys.length, 1);
  // Efter anonymisering er tallene de samme, men rejserne er væk.
  await anonymize_day(db, day);
  const later = await stats_from_archive(db, "myplanio", 0, Date.parse("2026-11-23T08:00:00Z"));
  assert.equal(later.views, 2);
  assert.equal(later.visitors, 1);
  assert.equal(later.journeys.length, 0);
});

test("datalagring: døgn med kode, anonymiserede døgn og næste anonymisering", async () => {
  const { db } = fake_d1();
  await db.batch(SCHEMA.map((q) => db.prepare(q)));
  await store_day(db, "2026-11-19", [ae_row("a", "2026-11-19 10:00:00"), ae_row("a", "2026-11-19 10:01:00")]);
  await store_day(db, "2026-11-20", [ae_row("b", "2026-11-20 10:00:00")]);
  await anonymize_day(db, "2026-11-19");
  const s = await storage_status(db, "myplanio", Date.parse("2026-11-23T08:00:00Z"));
  assert.equal(s?.archive_first, "2026-11-19");
  assert.equal(s?.archive_last, "2026-11-20");
  assert.equal(s?.coded_days, 1);
  assert.equal(s?.anonymized_days, 1);
  assert.equal(s?.anonymize_next, "2027-11-20");
  assert.equal(s?.archive_views, 3);
  assert.equal(s?.live_from, "2026-11-18");
  assert.ok(s?.last_run);
  // Ingen arkiv-binding: kortet vises ikke.
  assert.equal(await storage_status(undefined, "myplanio"), null);
});
