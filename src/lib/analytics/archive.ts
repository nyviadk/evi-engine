import { DATACENTER_ASNS, DATASET, OWN_CHECKS, OWN_CHECKS_ASN, run_sql } from "./query";
import { find_burst_bots, find_unclicked_visitors } from "./types";

// Permanent arkiv for Evi Stats: Analytics Engine sletter rækker efter ca.
// 3 måneder, så et cron-job kopierer hvert helt døgn (UTC) til D1, råt, så alle
// filtre og opgørelser også kan køres bagud. Efter 12 måneder slettes
// besøgskoden (det eneste, der gør rækkerne pseudonyme); robot-mærkning og
// døgnets unikke besøgende gemmes først, så de tal overlever.
declare global {
  interface CloudflareEnv {
    EVI_STATS_ARCHIVE?: D1Database;
  }
}

const DAY_MS = 86_400_000;
// Analytics Engine har ca. 90 dage; ældre end det findes ikke at hente.
const LOOKBACK_DAYS = 89;
// Bundne parametre pr. sætning er højst 100 i D1; én række = 15.
const COLUMNS = [
  "ts", "day", "repo", "hostname", "kind", "path", "referrer_host", "from_path",
  "country", "device", "visitor", "locale", "asn", "as_org", "sample_interval",
] as const;
const ROWS_PER_INSERT = 6;

const ANONYMIZE_AFTER_DAYS = 365;

export const SCHEMA = [
  // excluded: hvorfor besøget blev sorteret fra ("dev", "burst", "unclicked"),
  // sat før besøgskoden slettes, da de regler kræver koden.
  `CREATE TABLE IF NOT EXISTS pageviews (
    ts TEXT NOT NULL, day TEXT NOT NULL, repo TEXT NOT NULL, hostname TEXT, kind TEXT,
    path TEXT, referrer_host TEXT, from_path TEXT, country TEXT, device TEXT,
    visitor TEXT, locale TEXT, asn TEXT, as_org TEXT, sample_interval REAL NOT NULL DEFAULT 1,
    excluded TEXT NOT NULL DEFAULT ''
  )`,
  "CREATE INDEX IF NOT EXISTS pageviews_repo_day ON pageviews (repo, day)",
  "CREATE TABLE IF NOT EXISTS archived_days (day TEXT PRIMARY KEY, rows INTEGER NOT NULL, archived_at TEXT NOT NULL)",
  `CREATE TABLE IF NOT EXISTS daily_visitors (
    day TEXT NOT NULL, repo TEXT NOT NULL, visitors INTEGER NOT NULL, visitors_human INTEGER NOT NULL,
    PRIMARY KEY (day, repo)
  )`,
  "CREATE TABLE IF NOT EXISTS anonymized_days (day TEXT PRIMARY KEY, anonymized_at TEXT NOT NULL)",
];

export type DayRow = {
  repo: string;
  ts: string;
  kind: string;
  visitor: string;
  referrer_host: string;
  from_path: string;
  asn: string;
};

const is_own_check = (asn: string, ts: string): boolean =>
  asn === OWN_CHECKS_ASN && OWN_CHECKS.some(([from, to]) => ts >= from && ts <= to);

/**
 * Ét døgns rækker → hvilke besøgskoder der sorteres fra og hvorfor, og pr. repo
 * antal unikke besøgende på prod, før og efter alle filtre.
 */
export function classify_day(rows: DayRow[]): {
  excluded: Map<string, string>;
  visitors: Map<string, { all: number; human: number }>;
} {
  const excluded = new Map<string, string>();
  const visitors = new Map<string, { all: number; human: number }>();
  for (const repo of new Set(rows.map((r) => r.repo))) {
    const mine = rows.filter((r) => r.repo === repo && r.visitor);
    const prod = mine.filter((r) => r.kind === "prod");
    const dev = new Set(mine.filter((r) => r.kind === "staging").map((r) => r.visitor));
    const burst = find_burst_bots(prod.map((r) => ({ visitor: r.visitor, timestamp: r.ts, source: r.referrer_host, asn: r.asn })));
    const unclicked = find_unclicked_visitors(prod.map((r) => ({ visitor: r.visitor, source: r.referrer_host, from_path: r.from_path })));
    const machine = new Set(
      prod.filter((r) => DATACENTER_ASNS.includes(r.asn) || is_own_check(r.asn, r.ts)).map((r) => r.visitor),
    );
    const all = new Set(prod.map((r) => r.visitor));
    for (const v of all) {
      const reason = dev.has(v) ? "dev" : burst.has(v) ? "burst" : unclicked.has(v) ? "unclicked" : "";
      if (reason) excluded.set(v, reason);
    }
    const human = [...all].filter((v) => !excluded.has(v) && !machine.has(v)).length;
    visitors.set(repo, { all: all.size, human });
  }
  return { excluded, visitors };
}

const iso_day = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

/** Hele døgn (UTC), der endnu ikke er arkiveret, ældste først, til og med i går. */
export function days_to_archive(now: number, archived: Set<string>): string[] {
  const today = Math.floor(now / DAY_MS) * DAY_MS;
  const days: string[] = [];
  for (let d = today - LOOKBACK_DAYS * DAY_MS; d < today; d += DAY_MS) {
    const day = iso_day(d);
    if (!archived.has(day)) days.push(day);
  }
  return days;
}

/** Én Analytics Engine-række → værdier i COLUMNS-rækkefølge. */
export function to_archive_row(r: Record<string, unknown>): (string | number)[] {
  const s = (v: unknown) => String(v ?? "");
  const ts = s(r.timestamp);
  const si = Number(r.si);
  return [
    ts, ts.slice(0, 10), s(r.repo), s(r.b1), s(r.b2), s(r.b3), s(r.b4), s(r.b5),
    s(r.b6), s(r.b7), s(r.b8), s(r.b9), s(r.b10), s(r.b11), Number.isFinite(si) && si > 0 ? si : 1,
  ];
}

async function archive_day(
  db: D1Database,
  account_id: string,
  token: string,
  day: string,
): Promise<boolean> {
  const next = iso_day(Date.parse(`${day}T00:00:00Z`) + DAY_MS);
  const blobs = Array.from({ length: 11 }, (_, i) => `blob${i + 1} AS b${i + 1}`).join(", ");
  const rows = await run_sql(
    account_id,
    token,
    `SELECT timestamp, index1 AS repo, ${blobs}, _sample_interval AS si FROM ${DATASET} WHERE timestamp >= toDateTime('${day} 00:00:00') AND timestamp < toDateTime('${next} 00:00:00') ORDER BY timestamp LIMIT 100000`,
  );
  // Fejlet forespørgsel: prøv igen ved næste kørsel i stedet for at markere dagen.
  if (rows === null) return false;
  await store_day(db, day, rows);
  return true;
}

/** Skriver ét døgns rækker og markerer døgnet som arkiveret. */
export async function store_day(db: D1Database, day: string, rows: Record<string, unknown>[]): Promise<void> {
  const values = rows.map(to_archive_row);
  const statements: D1PreparedStatement[] = [db.prepare("DELETE FROM pageviews WHERE day = ?").bind(day)];
  for (let i = 0; i < values.length; i += ROWS_PER_INSERT) {
    const chunk = values.slice(i, i + ROWS_PER_INSERT);
    const placeholders = chunk.map(() => `(${COLUMNS.map(() => "?").join(", ")})`).join(", ");
    statements.push(
      db.prepare(`INSERT INTO pageviews (${COLUMNS.join(", ")}) VALUES ${placeholders}`).bind(...chunk.flat()),
    );
  }
  statements.push(
    db
      .prepare("INSERT OR REPLACE INTO archived_days (day, rows, archived_at) VALUES (?, ?, ?)")
      .bind(day, values.length, new Date().toISOString()),
  );
  // Én transaktion: dagen markeres kun som arkiveret, hvis alle rækker kom med.
  await db.batch(statements);
}

export async function anonymize_day(db: D1Database, day: string): Promise<void> {
  const rows = await db
    .prepare("SELECT repo, ts, kind, visitor, referrer_host, from_path, asn FROM pageviews WHERE day = ? AND visitor != ''")
    .bind(day)
    .all<DayRow>();
  const { excluded, visitors } = classify_day(rows.results);
  const statements: D1PreparedStatement[] = [];
  for (const [visitor, reason] of excluded) {
    statements.push(db.prepare("UPDATE pageviews SET excluded = ? WHERE day = ? AND visitor = ?").bind(reason, day, visitor));
  }
  for (const [repo, n] of visitors) {
    statements.push(
      db
        .prepare("INSERT OR REPLACE INTO daily_visitors (day, repo, visitors, visitors_human) VALUES (?, ?, ?, ?)")
        .bind(day, repo, n.all, n.human),
    );
  }
  statements.push(db.prepare("UPDATE pageviews SET visitor = '' WHERE day = ?").bind(day));
  statements.push(
    db.prepare("INSERT OR REPLACE INTO anonymized_days (day, anonymized_at) VALUES (?, ?)").bind(day, new Date().toISOString()),
  );
  // Én transaktion: koden slettes kun sammen med mærkningen og tallene.
  await db.batch(statements);
}

export async function add_missing_columns(db: D1Database): Promise<void> {
  const cols = await db.prepare("PRAGMA table_info(pageviews)").all<{ name: string }>();
  if (!cols.results.some((c) => c.name === "excluded")) {
    await db.prepare("ALTER TABLE pageviews ADD COLUMN excluded TEXT NOT NULL DEFAULT ''").run();
  }
}

/** Kaldes af cron (worker.ts). Arkiverer manglende døgn og anonymiserer døgn over 12 måneder. */
export async function archive_stats(env: CloudflareEnv, now = Date.now()): Promise<void> {
  const db = env.EVI_STATS_ARCHIVE;
  const account_id = env.EVI_STATS_ACCOUNT_ID;
  const token = env.EVI_STATS_QUERY_TOKEN;
  if (!db || !account_id || !token) {
    console.error("evi-stats-archive: mangler D1-binding eller Analytics Engine-adgang");
    return;
  }
  await db.batch(SCHEMA.map((sql) => db.prepare(sql)));
  await add_missing_columns(db);
  const done = await db.prepare("SELECT day FROM archived_days").all<{ day: string }>();
  const archived = new Set(done.results.map((r) => r.day));
  for (const day of days_to_archive(now, archived)) {
    const ok = await archive_day(db, account_id, token, day);
    console.info(`evi-stats-archive: ${day} ${ok ? "arkiveret" : "fejlede, prøver igen"}`);
    if (!ok) break;
  }

  const cutoff = iso_day(Math.floor(now / DAY_MS) * DAY_MS - ANONYMIZE_AFTER_DAYS * DAY_MS);
  const old = await db
    .prepare("SELECT day FROM archived_days WHERE day < ? AND day NOT IN (SELECT day FROM anonymized_days) ORDER BY day")
    .bind(cutoff)
    .all<{ day: string }>();
  for (const { day } of old.results) {
    await anonymize_day(db, day);
    console.info(`evi-stats-archive: ${day} anonymiseret`);
  }
}
