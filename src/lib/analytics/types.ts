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
  };
}

export const JOURNEY_LIMIT = 30;

// Rækker (nyeste først) → de seneste `limit` besøgende, hver med sine sider i
// rækkefølge. Koden skifter dagligt, så én kode = én besøgende samme døgn.
export function to_journeys(rows: Record<string, unknown>[], limit: number): Journey[] {
  const by_hash = new Map<string, Journey>();
  for (const r of rows) {
    const h = String(r.h ?? "");
    let j = by_hash.get(h);
    if (!j) {
      if (by_hash.size >= limit) continue;
      j = { country: "", device: "", network: "", referrer: "", pages: [] };
      by_hash.set(h, j);
    }
    // Ældre rækker kommer senere; den ældste beskriver ankomsten.
    j.pages.unshift({ time: String(r.t ?? ""), path: String(r.p ?? "") });
    j.country = String(r.c ?? "");
    j.device = String(r.d ?? "");
    j.network = String(r.n ?? "");
    j.referrer = String(r.r ?? "");
  }
  return [...by_hash.values()];
}
