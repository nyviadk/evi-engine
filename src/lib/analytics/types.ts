// Domæne-typer + konstanter for Evi Stats. Ingen runtime-afhængigheder, så
// render-/chart-laget ikke transitivt trækker Cloudflare-bindings ind (og kan
// unit-render'es/preview'es uden Worker-runtime).

export type NameCount = { name: string; count: number };
export type DayCount = { day: string; views: number };
export type Flow = { from: string; to: string; count: number };
export type Network = { name: string; asn: string; count: number; visitors: number };
/** Én besøgendes sider samme døgn (koden skifter dagligt), ældste først. */
export type Journey = {
  country: string;
  device: string;
  network: string;
  referrer: string;
  pages: { time: string; path: string }[];
};
/** Hvor tenantens data står i de tre trin: live, arkiv med besøgskode, anonymiseret. */
export type Storage = {
  /** Første dag, Analytics Engine stadig har (ca. 90 dage tilbage, tidligst lanceringen). */
  live_from: string;
  archive_first: string;
  archive_last: string;
  coded_days: number;
  anonymized_days: number;
  /** Dag, hvor det ældste døgn med besøgskode anonymiseres (12 måneder). */
  anonymize_next: string;
  /** Sidevisninger i arkivet, før robotfiltre. */
  archive_views: number;
  /** ISO-tid for seneste arkivering. */
  last_run: string;
};

export type StatsData = {
  ok: boolean;
  days: number;
  views: number;
  visitors: number;
  timeseries: DayCount[];
  top_pages: NameCount[];
  entry_pages: NameCount[];
  referrers: NameCount[];
  countries: NameCount[];
  devices: NameCount[];
  languages: NameCount[];
  flow: Flow[];
  networks: Network[];
  journeys: Journey[];
  /** Besøgende, der ligner robotter (bølger + flere sider uden klik), trukket fra alle tal. */
  bot_visitors: number;
  /** Tallene kommer fra det permanente arkiv (til og med i går), ikke Analytics Engine. */
  archive: boolean;
  storage: Storage | null;
};

/** Tilladte tidsintervaller (dage); 0 = alt. Andet input klampes til 30. */
export const RANGES = [7, 30, 90, 365, 0] as const;
export const ALL_DAYS = 0;
/** Længste interval, Analytics Engine selv har; længere læses fra arkivet. */
export const LIVE_MAX_DAYS = 90;

export function clamp_days(input: number): number {
  return (RANGES as readonly number[]).includes(input) ? input : 30;
}

export function range_label(days: number): string {
  if (days === ALL_DAYS) return "Alt";
  if (days === 365) return "1 år";
  return `${days} dage`;
}

export function empty_stats(days: number): StatsData {
  return {
    ok: false,
    days,
    views: 0,
    visitors: 0,
    timeseries: [],
    top_pages: [],
    entry_pages: [],
    referrers: [],
    countries: [],
    devices: [],
    languages: [],
    flow: [],
    networks: [],
    journeys: [],
    bot_visitors: 0,
    archive: false,
    storage: null,
  };
}

// Robot-bølge: mindst så mange besøgende inden for vinduet, der hver kun så én
// side, kom direkte og sad på hver sit netværk. Crawlere bag private proxyer
// skifter hjemme-netværk for hvert kald, så de kan ikke filtreres på ASN.
const BURST_MIN = 3;
const BURST_WINDOW_MS = 60_000;
// Søgninger kommer én ad gangen, aldrig som et kor: fem enkeltsidebesøg "via
// Google" på samme minut fra fire netværk er en falsk henvisning (20. nov.
// kl. 20.44: tolv på ét minut til vilkår og kontakt). Sociale medier er ikke
// med, for et opslag kan godt sende flere ind på én gang.
const SEARCH_BURST_MIN = 5;
const SEARCH_BURST_NETWORKS = 4;
const SEARCH_SOURCE = /(^|\.)(google|bing)\.[a-z.]+$/;

type Candidate = { hash: string; at: number; asn: string };

function mark_bursts(
  candidates: Candidate[],
  min_visits: number,
  min_networks: number,
  bots: Set<string>,
): void {
  candidates.forEach((first, i) => {
    // Sorteret efter tid, så vinduet slutter ved første besøg uden for det.
    const window: Candidate[] = [];
    for (let j = i; j < candidates.length; j++) {
      const c = candidates[j];
      if (!c || c.at - first.at > BURST_WINDOW_MS) break;
      window.push(c);
    }
    if (window.length >= min_visits && new Set(window.map((c) => c.asn)).size >= min_networks) {
      for (const c of window) bots.add(c.hash);
    }
  });
}

/**
 * Besøgskoder i robot-bølger ud fra rå visningsrækker (visitor, timestamp,
 * source, asn). Bevidst forsigtig: besøg med flere sider, fra samme netværk
 * (fx et kontor) eller via sociale medier tæller aldrig som robot; via en
 * søgemaskine kræver det en større bølge end direkte besøg.
 */
export function find_burst_bots(rows: Record<string, unknown>[]): Set<string> {
  const by_hash = new Map<string, { views: number; candidate: Candidate; source: string }>();
  for (const r of rows) {
    const hash = String(r.visitor ?? "");
    if (!hash) continue;
    const seen = by_hash.get(hash);
    if (seen) {
      seen.views += 1;
      continue;
    }
    const at = Date.parse(`${String(r.timestamp ?? "").replace(" ", "T")}Z`);
    by_hash.set(hash, {
      views: 1,
      source: String(r.source ?? ""),
      candidate: { hash, at, asn: String(r.asn ?? "") },
    });
  }

  const singles = [...by_hash.values()].filter(
    (v) => v.views === 1 && !Number.isNaN(v.candidate.at),
  );
  const by_time = (a: Candidate, b: Candidate) => a.at - b.at;
  const direct = singles.filter((v) => !v.source).map((v) => v.candidate).sort(by_time);
  const search = singles
    .filter((v) => SEARCH_SOURCE.test(v.source))
    .map((v) => v.candidate)
    .sort(by_time);

  const bots = new Set<string>();
  mark_bursts(direct, BURST_MIN, BURST_MIN, bots);
  mark_bursts(search, SEARCH_BURST_MIN, SEARCH_BURST_NETWORKS, bots);
  return bots;
}

/**
 * Besøgskoder med flere visninger, hvor ingen kom fra et klik: hver side er
 * hentet direkte (ingen henvisning og ingen intern afsender). Et menneske, der
 * klikker videre, giver altid en afsender (Referer eller beaconens from_path);
 * flere sider uden er robotter, der kalder adresser, eller genindlæsninger.
 */
export function find_unclicked_visitors(rows: Record<string, unknown>[]): Set<string> {
  const by_hash = new Map<string, { views: number; clicked: boolean }>();
  for (const r of rows) {
    const hash = String(r.visitor ?? "");
    if (!hash) continue;
    const v = by_hash.get(hash) ?? { views: 0, clicked: false };
    v.views += 1;
    if (String(r.source ?? "") || String(r.from_path ?? "")) v.clicked = true;
    by_hash.set(hash, v);
  }
  return new Set([...by_hash].filter(([, v]) => v.views >= 2 && !v.clicked).map(([h]) => h));
}

export const JOURNEY_LIMIT = 30;

// Rækker (nyeste først) → de seneste `limit` besøgende, hver med sine sider i
// rækkefølge. Koden skifter dagligt, så én kode = én besøgende samme døgn.
export function to_journeys(rows: Record<string, unknown>[], limit: number): Journey[] {
  const by_hash = new Map<string, Journey>();
  for (const r of rows) {
    const h = String(r.visitor ?? "");
    let j = by_hash.get(h);
    if (!j) {
      if (by_hash.size >= limit) continue;
      j = { country: "", device: "", network: "", referrer: "", pages: [] };
      by_hash.set(h, j);
    }
    // Ældre rækker kommer senere; den ældste beskriver ankomsten.
    j.pages.unshift({ time: String(r.timestamp ?? ""), path: String(r.page_path ?? "") });
    j.country = String(r.country ?? "");
    j.device = String(r.device ?? "");
    j.network = String(r.network ?? "");
    j.referrer = String(r.source ?? "");
  }
  return [...by_hash.values()];
}
