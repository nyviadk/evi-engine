import { getCloudflareContext } from "@opennextjs/cloudflare";

// Læses via SQL-API'et (HTTP), ikke en binding — sat via `wrangler secret put`.
declare global {
  interface CloudflareEnv {
    EVI_STATS_QUERY_TOKEN?: string;
    EVI_STATS_ACCOUNT_ID?: string;
  }
}

export type NameCount = { name: string; count: number };
export type Flow = { from: string; to: string; count: number };
export type StatsData = {
  ok: boolean;
  days: number;
  views: number;
  visitors: number;
  top_pages: NameCount[];
  entry_pages: NameCount[];
  referrers: NameCount[];
  countries: NameCount[];
  devices: NameCount[];
  languages: NameCount[];
  flow: Flow[];
};

// Bump navnet for at "nulstille": et nyt dataset starter tomt, gammel data
// forældes (Analytics Engine kan ikke slette — kun ældes ud efter ~3 mdr.).
const DATASET = "evi_stats_v1";
const DAYS = 30;

const EMPTY: StatsData = {
  ok: false,
  days: DAYS,
  views: 0,
  visitors: 0,
  top_pages: [],
  entry_pages: [],
  referrers: [],
  countries: [],
  devices: [],
  languages: [],
  flow: [],
};

async function run_sql(
  account_id: string,
  token: string,
  sql: string,
): Promise<Record<string, unknown>[]> {
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account_id}/analytics_engine/sql`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: `${sql} FORMAT JSON`,
      },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: Record<string, unknown>[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

function to_name_count(rows: Record<string, unknown>[]): NameCount[] {
  return rows.map((r) => ({
    name: String(r.name ?? ""),
    count: Number(r.c ?? 0),
  }));
}

/**
 * Henter aggregeret statistik for én tenant (repo) fra Analytics Engine, kun
 * `prod`-trafik, seneste 30 dage. SUM(_sample_interval) korrigerer for evt.
 * sampling. repo er allerede HMAC-verificeret; valideres + escapes alligevel.
 */
export async function query_stats(repo_in: string): Promise<StatsData> {
  if (!/^[a-z0-9-]+$/.test(repo_in)) return EMPTY;
  const repo = repo_in;

  const cf = await getCloudflareContext({ async: true }).catch(() => null);
  const account_id = cf?.env?.EVI_STATS_ACCOUNT_ID;
  const token = cf?.env?.EVI_STATS_QUERY_TOKEN;
  if (!account_id || !token) return EMPTY;

  const q = (sql: string): Promise<Record<string, unknown>[]> =>
    run_sql(account_id, token, sql);

  // Auto-ekskludér operatørens egne besøg: besøgs-hashen er repo-scoped, så en
  // hash der også har ramt et staging/preview-domæne (fx kunde.nyvia.dk) i
  // perioden er ikke en rigtig kunde (kunder kender ikke dev-URL'en) → fjern den
  // fra prod-tallene. Hashen roterer dagligt, så det gælder pr. dag.
  const staging = await q(
    `SELECT DISTINCT blob8 AS h FROM ${DATASET} WHERE index1 = '${repo}' AND blob2 = 'staging' AND blob8 != '' AND timestamp > now() - INTERVAL '${DAYS}' DAY LIMIT 1000`,
  );
  const dev_hashes = staging
    .map((r) => String(r.h ?? ""))
    .filter((h) => /^[0-9a-f]{1,64}$/.test(h));
  const exclude = dev_hashes.length
    ? ` AND blob8 NOT IN (${dev_hashes.map((h) => `'${h}'`).join(",")})`
    : "";

  const base = `index1 = '${repo}' AND blob2 = 'prod' AND timestamp > now() - INTERVAL '${DAYS}' DAY${exclude}`;

  const [
    views,
    visitors,
    pages,
    entries,
    refs,
    countries,
    devices,
    languages,
    flow,
  ] = await Promise.all([
      q(`SELECT SUM(_sample_interval) AS c FROM ${DATASET} WHERE ${base}`),
      q(
        `SELECT count(DISTINCT blob8) AS c FROM ${DATASET} WHERE ${base} AND blob8 != ''`,
      ),
      q(
        `SELECT blob3 AS name, SUM(_sample_interval) AS c FROM ${DATASET} WHERE ${base} GROUP BY blob3 ORDER BY c DESC LIMIT 15`,
      ),
      q(
        `SELECT blob3 AS name, SUM(_sample_interval) AS c FROM ${DATASET} WHERE ${base} AND blob5 = '' GROUP BY blob3 ORDER BY c DESC LIMIT 15`,
      ),
      q(
        `SELECT blob4 AS name, SUM(_sample_interval) AS c FROM ${DATASET} WHERE ${base} AND blob4 != '' GROUP BY blob4 ORDER BY c DESC LIMIT 15`,
      ),
      q(
        `SELECT blob6 AS name, SUM(_sample_interval) AS c FROM ${DATASET} WHERE ${base} AND blob6 != '' GROUP BY blob6 ORDER BY c DESC LIMIT 15`,
      ),
      q(
        `SELECT blob7 AS name, SUM(_sample_interval) AS c FROM ${DATASET} WHERE ${base} GROUP BY blob7 ORDER BY c DESC`,
      ),
      q(
        `SELECT blob9 AS name, SUM(_sample_interval) AS c FROM ${DATASET} WHERE ${base} AND blob9 != '' GROUP BY blob9 ORDER BY c DESC LIMIT 15`,
      ),
      q(
        `SELECT blob5 AS \`from\`, blob3 AS \`to\`, SUM(_sample_interval) AS c FROM ${DATASET} WHERE ${base} AND blob5 != '' GROUP BY blob5, blob3 ORDER BY c DESC LIMIT 30`,
      ),
    ]);

  return {
    ok: true,
    days: DAYS,
    views: Number(views[0]?.c ?? 0),
    visitors: Number(visitors[0]?.c ?? 0),
    top_pages: to_name_count(pages),
    entry_pages: to_name_count(entries),
    referrers: to_name_count(refs),
    countries: to_name_count(countries),
    devices: to_name_count(devices),
    languages: to_name_count(languages),
    flow: flow.map((r) => ({
      from: String(r.from ?? ""),
      to: String(r.to ?? ""),
      count: Number(r.c ?? 0),
    })),
  };
}
