import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  ALL_DAYS,
  LIVE_MAX_DAYS,
  clamp_days,
  empty_stats,
  find_burst_bots,
  find_unclicked_visitors,
  to_journeys,
  JOURNEY_LIMIT,
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
export const DATASET = "evi_stats_v1";
const DAY_MS = 86_400_000;

// Tal tæller først fra My Planios lancering (UTC): før det var al prod-trafik
// vores egne tjek af det nye domæne. Gælder alle, men der var ingen andre live.
export const STATS_START = "2026-11-18 17:15:00";

// Datacenter/cloud-ASN'er hvor næsten al trafik er bots/crawlere. Ekskluderet
// fra prod-tal. ASN gemmes som blob10, så listen kan justeres uden re-indsamling.
// Bemærk: fanger også ægte brugere bag cloud-VPN/-proxy på disse ASN'er;
// forbruger-VPN som Proton (egen ASN) er IKKE med.
export const DATACENTER_ASNS = [
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
  "9009", // M247 (hosting + VPN-udgange)
  "60068", "212238", // Datacamp / CDN77
  "43444", // Fast Servers ("Fine Group Servers Solutions")
  "213954", // Global Transit Systems ("NETLABS")
  "54538", // Palo Alto Networks (sårbarheds-scanner)
  "48090", // DMZHOST / Techoff SRV (sårbarheds-scanner, NL)
  "64286", // LogicWeb (hosting)
  "26548", // PureVoltage Hosting ("Fine Group Servers")
  "46475", "59651", // Fine Group Servers Solutions (flere netværk)
  "207990", // HostRoyale (hosting + proxy)
  "30633", // Leaseweb USA
  "12876", // Scaleway
];

// Vores egne browser-tjek af live-domænet, før de sendte "evi-check-bot" i UA'en
// (WebKit ligner en almindelig Safari). Tidsrum i UTC med 3 min margen, fundet i
// samtaleloggen; kun fra det netværk, tjekkene kørte fra. Rå UA gemmes ikke, så
// de kan ikke kendes på andet end tid og netværk.
export const OWN_CHECKS_ASN = "208172";
export const OWN_CHECKS: [string, string][] = [
  ["2026-11-18 17:30:00", "2026-11-18 17:38:00"],
  ["2026-11-18 20:09:00", "2026-11-18 20:25:00"],
  ["2026-11-20 11:36:00", "2026-11-20 11:43:00"],
  ["2026-11-20 12:35:00", "2026-11-20 12:48:00"],
  ["2026-11-20 13:23:00", "2026-11-20 13:31:00"],
  ["2026-11-21 10:12:00", "2026-11-21 10:20:00"],
  ["2026-11-21 11:18:00", "2026-11-21 11:30:00"],
  ["2026-11-21 12:06:00", "2026-11-21 12:13:00"],
  ["2026-11-21 12:49:00", "2026-11-21 12:56:00"],
  ["2026-11-21 14:20:00", "2026-11-21 14:26:00"],
];
// Kun AND/OR og sammenligninger (Analytics Engines SQL er et lille subset):
// behold rækken, hvis den er fra et andet netværk eller uden for alle tidsrum.
const own_checks_sql = ` AND (blob10 != '${OWN_CHECKS_ASN}' OR (${OWN_CHECKS.map(
  ([from, to]) => `(timestamp < toDateTime('${from}') OR timestamp > toDateTime('${to}'))`,
).join(" AND ")}))`;

export async function run_sql(
  account_id: string,
  token: string,
  sql: string,
): Promise<Record<string, unknown>[] | null> {
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account_id}/analytics_engine/sql`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: `${sql} FORMAT JSON`,
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Record<string, unknown>[] };
    return json.data ?? [];
  } catch {
    return null;
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
  if (days === ALL_DAYS || days > LIVE_MAX_DAYS) return query_archive_stats(repo, days);

  const cf = await getCloudflareContext({ async: true }).catch(() => null);
  const account_id = cf?.env?.EVI_STATS_ACCOUNT_ID;
  const token = cf?.env?.EVI_STATS_QUERY_TOKEN;
  if (!account_id || !token) return empty_stats(days);

  // Gruppering med parenteser står ikke i Analytics Engines SQL-dokumentation.
  // Afviser den filteret for egne tjek, vises tallene hellere med dem end tomme.
  const q = async (sql: string): Promise<Record<string, unknown>[]> =>
    (await run_sql(account_id, token, sql)) ??
    (sql.includes(own_checks_sql)
      ? ((await run_sql(account_id, token, sql.replaceAll(own_checks_sql, ""))) ?? [])
      : []);

  // Auto-ekskludér operatørens egne besøg: besøgs-hashen er repo-scoped, så en
  // hash der også har ramt et staging/preview-domæne (fx kunde.nyvia.dk) i
  // perioden er ikke en rigtig kunde (kunder kender ikke dev-URL'en) → fjern den
  // fra prod-tallene. Hashen roterer dagligt, så det gælder pr. dag. Besøgende i
  // robot-bølger (find_burst_bots) fjernes på samme måde.
  const dc = ` AND blob10 NOT IN (${DATACENTER_ASNS.map((a) => `'${a}'`).join(",")})`;
  const prod = `index1 = '${repo}' AND blob2 = 'prod' AND timestamp > now() - INTERVAL '${days}' DAY AND timestamp >= toDateTime('${STATS_START}')${dc}${own_checks_sql}`;

  const [staging, recent] = await Promise.all([
    q(
      `SELECT DISTINCT blob8 AS h FROM ${DATASET} WHERE index1 = '${repo}' AND blob2 = 'staging' AND blob8 != '' AND timestamp > now() - INTERVAL '${days}' DAY LIMIT 1000`,
    ),
    // Rå rækker til robot-bølgerne. Fejler forespørgslen, er listen tom, og der
    // filtreres bare ingen bølger fra.
    q(
      `SELECT timestamp, blob8 AS visitor, blob4 AS source, blob5 AS from_path, blob10 AS asn FROM ${DATASET} WHERE ${prod} AND blob8 != '' ORDER BY timestamp DESC LIMIT 10000`,
    ),
  ]);
  const is_hash = (h: string) => /^[0-9a-f]{1,64}$/.test(h);
  const dev_hashes = new Set(staging.map((r) => String(r.h ?? "")).filter(is_hash));
  const bot_hashes = [
    ...new Set([...find_burst_bots(recent), ...find_unclicked_visitors(recent)]),
  ].filter((h) => is_hash(h) && !dev_hashes.has(h));
  const excluded = [...dev_hashes, ...bot_hashes];
  const exclude = excluded.length
    ? ` AND blob8 NOT IN (${excluded.map((h) => `'${h}'`).join(",")})`
    : "";
  const base = `${prod}${exclude}`;

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
    networks,
    visits,
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
      // Ikke "from"/"to" som alias: reserverede ord.
      `SELECT blob5 AS src, blob3 AS dst, SUM(_sample_interval) AS c FROM ${DATASET} WHERE ${base} AND blob5 != '' GROUP BY blob5, blob3 ORDER BY c DESC LIMIT 30`,
    ),
    q(
      `SELECT blob11 AS name, blob10 AS asn, SUM(_sample_interval) AS c, count(DISTINCT blob8) AS u FROM ${DATASET} WHERE ${base} AND blob11 != '' GROUP BY blob11, blob10 ORDER BY c DESC LIMIT 25`,
    ),
    q(
      `SELECT timestamp, blob8 AS visitor, blob3 AS page_path, blob6 AS country, blob7 AS device, blob11 AS network, blob4 AS source FROM ${DATASET} WHERE ${base} AND blob8 != '' ORDER BY timestamp DESC LIMIT 1000`,
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
      from: String(r.src ?? ""),
      to: String(r.dst ?? ""),
      count: Number(r.c ?? 0),
    })),
    networks: networks.map((r) => ({
      name: String(r.name ?? ""),
      asn: String(r.asn ?? ""),
      count: Number(r.c ?? 0),
      visitors: Number(r.u ?? 0),
    })),
    journeys: to_journeys(visits, JOURNEY_LIMIT),
    bot_visitors: bot_hashes.length,
    archive: false,
  };
}

/**
 * Samme tal fra det permanente arkiv (D1), til og med i går. Arkivet har
 * allerede mærket robotter og os selv pr. døgn (archive.ts), så forespørgslerne
 * filtrerer på `excluded` i stedet for lange lister af besøgskoder; unikke
 * besøgende kommer fra døgntallene, fordi koderne slettes efter 12 måneder.
 */
async function query_archive_stats(repo: string, days: number): Promise<StatsData> {
  const cf = await getCloudflareContext({ async: true }).catch(() => null);
  const db = cf?.env?.EVI_STATS_ARCHIVE;
  if (!db) return { ...empty_stats(days), archive: true };
  return stats_from_archive(db, repo, days);
}

export async function stats_from_archive(
  db: D1Database,
  repo: string,
  days: number,
  now = Date.now(),
): Promise<StatsData> {
  const yesterday = Math.floor(now / DAY_MS) * DAY_MS - DAY_MS;
  const start = Date.parse(`${STATS_START.slice(0, 10)}T00:00:00Z`);
  const from_ms = days === ALL_DAYS ? start : Math.max(start, yesterday - (days - 1) * DAY_MS);
  const from = new Date(from_ms).toISOString().slice(0, 10);
  const span = Math.round((yesterday - from_ms) / DAY_MS) + 1;

  const dc = DATACENTER_ASNS.map((a) => `'${a}'`).join(",");
  const own = OWN_CHECKS.map(([a, b]) => `(ts >= '${a}' AND ts <= '${b}')`).join(" OR ");
  // Kun to bundne parametre (repo, fra-dag) i samme rækkefølge i alle forespørgsler.
  const base = `repo = ? AND day >= ? AND kind = 'prod' AND excluded = '' AND ts >= '${STATS_START}' AND asn NOT IN (${dc}) AND NOT (asn = '${OWN_CHECKS_ASN}' AND (${own}))`;
  const q = async (sql: string): Promise<Record<string, unknown>[]> =>
    db
      .prepare(sql)
      .bind(repo, from)
      .all<Record<string, unknown>>()
      .then((r) => r.results)
      .catch(() => []);
  const top = (col: string, extra = "") =>
    q(`SELECT ${col} AS name, SUM(sample_interval) AS c FROM pageviews WHERE ${base}${extra} GROUP BY ${col} ORDER BY c DESC LIMIT 15`);

  const [views, counts, series, pages, entries, refs, countries, devices, languages, flow, networks, visits] =
    await Promise.all([
      q(`SELECT SUM(sample_interval) AS c FROM pageviews WHERE ${base}`),
      q("SELECT SUM(visitors_human) AS human, SUM(visitors_bot) AS bot FROM daily_visitors WHERE repo = ? AND day >= ?"),
      q(`SELECT day, SUM(sample_interval) AS c FROM pageviews WHERE ${base} GROUP BY day ORDER BY day`),
      top("path"),
      top("path", " AND from_path = ''"),
      top("referrer_host", " AND referrer_host != ''"),
      top("country", " AND country != ''"),
      top("device"),
      top("locale", " AND locale != ''"),
      q(`SELECT from_path AS src, path AS dst, SUM(sample_interval) AS c FROM pageviews WHERE ${base} AND from_path != '' GROUP BY from_path, path ORDER BY c DESC LIMIT 30`),
      q(`SELECT as_org AS name, asn, SUM(sample_interval) AS c, count(DISTINCT NULLIF(visitor, '')) AS u FROM pageviews WHERE ${base} AND as_org != '' GROUP BY as_org, asn ORDER BY c DESC LIMIT 25`),
      q(`SELECT ts AS timestamp, visitor, path AS page_path, country, device, as_org AS network, referrer_host AS source FROM pageviews WHERE ${base} AND visitor != '' ORDER BY ts DESC LIMIT 1000`),
    ]);

  return {
    ok: true,
    days,
    views: Number(views[0]?.c ?? 0),
    visitors: Number(counts[0]?.human ?? 0),
    timeseries: build_timeseries(series, span, yesterday),
    top_pages: to_name_count(pages),
    entry_pages: to_name_count(entries),
    referrers: to_name_count(refs),
    countries: to_name_count(countries),
    devices: to_name_count(devices),
    languages: to_name_count(languages),
    flow: flow.map((r) => ({ from: String(r.src ?? ""), to: String(r.dst ?? ""), count: Number(r.c ?? 0) })),
    networks: networks.map((r) => ({
      name: String(r.name ?? ""),
      asn: String(r.asn ?? ""),
      count: Number(r.c ?? 0),
      visitors: Number(r.u ?? 0),
    })),
    journeys: to_journeys(visits, JOURNEY_LIMIT),
    bot_visitors: Number(counts[0]?.bot ?? 0),
    archive: true,
  };
}
