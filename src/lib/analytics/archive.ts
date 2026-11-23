import { DATASET, run_sql } from "./query";

// Permanent arkiv for Evi Stats: Analytics Engine sletter rækker efter ca.
// 3 måneder, så et cron-job kopierer hvert helt døgn (UTC) til D1, råt, så alle
// filtre og opgørelser også kan køres bagud senere.
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

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS pageviews (
    ts TEXT NOT NULL, day TEXT NOT NULL, repo TEXT NOT NULL, hostname TEXT, kind TEXT,
    path TEXT, referrer_host TEXT, from_path TEXT, country TEXT, device TEXT,
    visitor TEXT, locale TEXT, asn TEXT, as_org TEXT, sample_interval REAL NOT NULL DEFAULT 1
  )`,
  "CREATE INDEX IF NOT EXISTS pageviews_repo_day ON pageviews (repo, day)",
  "CREATE TABLE IF NOT EXISTS archived_days (day TEXT PRIMARY KEY, rows INTEGER NOT NULL, archived_at TEXT NOT NULL)",
];

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
  return true;
}

/** Kaldes af cron (worker.ts). Arkiverer alle manglende hele døgn. */
export async function archive_stats(env: CloudflareEnv, now = Date.now()): Promise<void> {
  const db = env.EVI_STATS_ARCHIVE;
  const account_id = env.EVI_STATS_ACCOUNT_ID;
  const token = env.EVI_STATS_QUERY_TOKEN;
  if (!db || !account_id || !token) {
    console.error("evi-stats-archive: mangler D1-binding eller Analytics Engine-adgang");
    return;
  }
  await db.batch(SCHEMA.map((sql) => db.prepare(sql)));
  const done = await db.prepare("SELECT day FROM archived_days").all<{ day: string }>();
  const archived = new Set(done.results.map((r) => r.day));
  for (const day of days_to_archive(now, archived)) {
    const ok = await archive_day(db, account_id, token, day);
    console.info(`evi-stats-archive: ${day} ${ok ? "arkiveret" : "fejlede, prøver igen"}`);
    if (!ok) return;
  }
}
