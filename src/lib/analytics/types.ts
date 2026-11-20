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
  /** Besøgende i robot-bølger (find_burst_bots), trukket fra alle tal. */
  bot_visitors: number;
};

/** Tilladte tidsintervaller (dage). Andet input klampes til 30. */
export const RANGES = [7, 30, 90] as const;

export function clamp_days(input: number): number {
  return (RANGES as readonly number[]).includes(input) ? input : 30;
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
  };
}

// Robot-bølge: mindst så mange besøgende inden for vinduet, der hver kun så én
// side, kom direkte og sad på hver sit netværk. Crawlere bag private proxyer
// skifter hjemme-netværk for hvert kald, så de kan ikke filtreres på ASN.
const BURST_MIN = 3;
const BURST_WINDOW_MS = 60_000;

type Candidate = { hash: string; at: number; asn: string };

/**
 * Besøgskoder i robot-bølger ud fra rå visningsrækker (visitor, timestamp,
 * source, asn). Bevidst forsigtig: besøg via en henvisning, med flere sider
 * eller fra samme netværk (fx et kontor) tæller aldrig som robot.
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

  const candidates = [...by_hash.values()]
    .filter((v) => v.views === 1 && !v.source && !Number.isNaN(v.candidate.at))
    .map((v) => v.candidate)
    .sort((a, b) => a.at - b.at);

  const bots = new Set<string>();
  candidates.forEach((first, i) => {
    // Sorteret efter tid, så vinduet slutter ved første besøg uden for det.
    const window: Candidate[] = [];
    for (let j = i; j < candidates.length; j++) {
      const c = candidates[j];
      if (!c || c.at - first.at > BURST_WINDOW_MS) break;
      window.push(c);
    }
    if (window.length >= BURST_MIN && new Set(window.map((c) => c.asn)).size >= BURST_MIN) {
      for (const c of window) bots.add(c.hash);
    }
  });
  return bots;
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
