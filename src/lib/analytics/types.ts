// Domæne-typer + konstanter for Evi Stats. Ingen runtime-afhængigheder, så
// render-/chart-laget ikke transitivt trækker Cloudflare-bindings ind (og kan
// unit-render'es/preview'es uden Worker-runtime).

export type NameCount = { name: string; count: number };
export type DayCount = { day: string; views: number };
export type Flow = { from: string; to: string; count: number };
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
  };
}
