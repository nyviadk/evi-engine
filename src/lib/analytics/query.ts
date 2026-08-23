import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  clamp_days,
  empty_stats,
  type DayCount,
  type NameCount,
  type StatsData,
} from "./types";

// Læses via SQL-API'et (HTTP), ikke en binding — sat via `wrangler secret put`.
declare global {
  interface CloudflareEnv {
    EVI_STATS_QUERY_TOKEN?: string;
    EVI_STATS_ACCOUNT_ID?: string;
  }
}

// Bump navnet for at "nulstille": et nyt dataset starter tomt, gammel data
// forældes (Analytics Engine kan ikke slette — kun ældes ud efter ~3 mdr.).
const DATASET = "evi_stats_v1";
const DAY_MS = 86_400_000;

// Datacenter/cloud-ASN'er hvor næsten al trafik er bots/crawlere. Ekskluderet
// fra prod-tal. ASN gemmes som blob10, så listen kan justeres uden re-indsamling.
// Bemærk: fanger også ægte brugere bag cloud-VPN/-proxy på disse ASN'er;
// forbruger-VPN som Proton (egen ASN) er IKKE med.
const DATACENTER_ASNS = [
  "16509", "14618", // Amazon AWS
  "8075", // Microsoft Azure
  "15169", "396982", // Google (Googlebot + Cloud)
  "14061", // DigitalOcean
  "16276", // OVH
  "24940", // Hetzner
  "63949", // Akamai / Linode
  "20473", // Vultr / Choopa
  "45102", // Alibaba Cloud
  "31898", // Oracle Cloud
];

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

// SQL returnerer kun dage MED data → byg en kontinuerlig serie af `days` UTC-dage
// (ældste→nyeste) med 0 i hullerne, så x-aksen er jævn. AE's dag-grænser er UTC,
// og nøglerne genereres via toISOString (også UTC), så de matcher.
function build_timeseries(
  rows: Record<string, unknown>[],
  days: number,
  now: number,
): DayCount[] {
  const by_day = new Map<string, number>();
  for (const r of rows) {
    const key = String(r.day ?? "").slice(0, 10);
    if (key) by_day.set(key, Number(r.c ?? 0));
  }
  const out: DayCount[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(now - i * DAY_MS).toISOString().slice(0, 10);
    out.push({ day: key, views: by_day.get(key) ?? 0 });
  }
  return out;
}

/**
 * Henter aggregeret statistik for én tenant (repo) fra Analytics Engine, kun
 * `prod`-trafik, over `days` dage. SUM(_sample_interval) korrigerer for evt.
 * sampling. repo er allerede HMAC-verificeret; valideres + escapes alligevel.
 */
export async function query_stats(
  repo_in: string,
  days_in: number,
): Promise<StatsData> {
  const days = clamp_days(days_in);
  if (!/^[a-z0-9-]+$/.test(repo_in)) return empty_stats(days);
  const repo = repo_in;

  const cf = await getCloudflareContext({ async: true }).catch(() => null);
  const account_id = cf?.env?.EVI_STATS_ACCOUNT_ID;
  const token = cf?.env?.EVI_STATS_QUERY_TOKEN;
  if (!account_id || !token) return empty_stats(days);

  const q = (sql: string): Promise<Record<string, unknown>[]> =>
    run_sql(account_id, token, sql);

  // Auto-ekskludér operatørens egne besøg: besøgs-hashen er repo-scoped, så en
  // hash der også har ramt et staging/preview-domæne (fx kunde.nyvia.dk) i
  // perioden er ikke en rigtig kunde (kunder kender ikke dev-URL'en) → fjern den
  // fra prod-tallene. Hashen roterer dagligt, så det gælder pr. dag.
  const staging = await q(
    `SELECT DISTINCT blob8 AS h FROM ${DATASET} WHERE index1 = '${repo}' AND blob2 = 'staging' AND blob8 != '' AND timestamp > now() - INTERVAL '${days}' DAY LIMIT 1000`,
  );
  const dev_hashes = staging
    .map((r) => String(r.h ?? ""))
    .filter((h) => /^[0-9a-f]{1,64}$/.test(h));
  const exclude = dev_hashes.length
    ? ` AND blob8 NOT IN (${dev_hashes.map((h) => `'${h}'`).join(",")})`
    : "";

  const dc = ` AND blob10 NOT IN (${DATACENTER_ASNS.map((a) => `'${a}'`).join(",")})`;
  const base = `index1 = '${repo}' AND blob2 = 'prod' AND timestamp > now() - INTERVAL '${days}' DAY${exclude}${dc}`;

  // Top-N efter en blob-kolonne (DRY — samme form for sider/kilder/lande/…).
  const top = (col: string, extra = ""): Promise<Record<string, unknown>[]> =>
    q(
      `SELECT ${col} AS name, SUM(_sample_interval) AS c FROM ${DATASET} WHERE ${base}${extra} GROUP BY ${col} ORDER BY c DESC LIMIT 15`,
    );

  const [
    views,
    visitors,
    series,
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
      `SELECT toStartOfInterval(timestamp, INTERVAL '1' DAY) AS day, SUM(_sample_interval) AS c FROM ${DATASET} WHERE ${base} GROUP BY day ORDER BY day`,
    ),
    top("blob3"),
    top("blob3", " AND blob5 = ''"),
    top("blob4", " AND blob4 != ''"),
    top("blob6", " AND blob6 != ''"),
    top("blob7"),
    top("blob9", " AND blob9 != ''"),
    q(
      `SELECT blob5 AS \`from\`, blob3 AS \`to\`, SUM(_sample_interval) AS c FROM ${DATASET} WHERE ${base} AND blob5 != '' GROUP BY blob5, blob3 ORDER BY c DESC LIMIT 30`,
    ),
  ]);

  return {
    ok: true,
    days,
    views: Number(views[0]?.c ?? 0),
    visitors: Number(visitors[0]?.c ?? 0),
    timeseries: build_timeseries(series, days, Date.now()),
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
