"use client";

import { createContext, use, useState } from "react";

import {
  PlanioEnergyBar,
  energy_segments,
} from "@/src/components/planio/PlanioEnergyBar";
import { cn } from "@/src/lib/utils/cn";

const MINUS = "−";
// Lav energi = højst 30%, samme bånd som appens "En træt dag".
const LOW_ENERGY = 30;
const PERCENT_TOKEN = "{procent}";

export type PlanioDemoEvent = {
  key: string;
  /** Procent: minus tager energi, plus giver. */
  energy: number;
  /** Morgendagens begivenheder tæller ikke med i dagens energi. */
  tomorrow: boolean;
  checked: boolean;
};

export type PlanioDemoTemplates = {
  start: string | null;
  balance: string | null;
  over: string | null;
  zero: string | null;
  short: string | null;
};

type DemoState = {
  start: number;
  planned: number;
  left: number;
  anyToday: boolean;
  tomorrowLow: boolean;
  isChecked: (key: string) => boolean;
  toggle: (key: string) => void;
};

const DemoContext = createContext<DemoState | null>(null);

function useDemo(): DemoState {
  const state = use(DemoContext);
  if (!state) throw new Error("PlanioDemo-dele skal ligge inde i <PlanioDemo>.");
  return state;
}

function format_change(value: number): string {
  if (value > 0) return `+${value}%`;
  if (value < 0) return `${MINUS}${-value}%`;
  return "0%";
}

function format_level(value: number): string {
  return value < 0 ? `${MINUS}${-value}%` : `${value}%`;
}

export type PlanioDemoProps = {
  /** Dagens energi i procent, før noget er planlagt. */
  start: number;
  events: PlanioDemoEvent[];
  children: React.ReactNode;
};

/**
 * Demoen "Planlæg dagen": afkryds begivenheder og se energien ændre sig.
 * Holder kun afkrydsningen; al tekst renderes på serveren og sendes ind.
 *
 * Mobil: flex-kolonne, så måleren kan være sticky (et grid-element kan ikke
 * flytte sig ud af sin celle). Bredt: måler + status til venstre, liste til
 * højre. Grid-placering frem for EviSplit, fordi status står under listen på
 * mobil, men under måleren på bredt.
 */
export function PlanioDemo({
  start,
  events,
  children,
}: PlanioDemoProps): React.ReactElement {
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(events.map((event) => [event.key, event.checked])),
  );

  const today = events.filter((event) => !event.tomorrow && checked[event.key]);
  const planned = today.reduce((sum, event) => sum + event.energy, 0);
  const left = start + planned;

  const state: DemoState = {
    start,
    planned,
    left,
    anyToday: today.length > 0,
    tomorrowLow:
      left <= LOW_ENERGY &&
      events.some((event) => event.tomorrow && checked[event.key]),
    isChecked: (key) => checked[key] ?? false,
    toggle: (key) => setChecked((prev) => ({ ...prev, [key]: !prev[key] })),
  };

  return (
    <DemoContext value={state}>
      <div
        data-slot="planio-demo"
        className="flex w-full flex-col gap-5 @3xl/section:grid @3xl/section:grid-cols-[5fr_7fr] @3xl/section:grid-rows-[auto_1fr] @3xl/section:items-start @3xl/section:gap-x-8"
      >
        {children}
      </div>
    </DemoContext>
  );
}

/**
 * Tal + batteri. Sticky på mobil, så man ser energien, mens man krydser af;
 * de negative marginer (= PlanioFrames padding) lader baggrunden gå ud til
 * kanten. Container, så tallene kan blive mindre, når måleren er smal.
 */
export function PlanioDemoMeter({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div
      data-slot="planio-demo-meter"
      className="@container/meter sticky top-0 z-10 -mx-3 flex flex-col gap-4 bg-(--theme-bg) p-3 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 @3xl/section:static @3xl/section:col-start-1 @3xl/section:row-start-1 @3xl/section:mx-0 @3xl/section:gap-5 @3xl/section:bg-transparent @3xl/section:p-0"
    >
      {children}
    </div>
  );
}

export function PlanioDemoStats({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  // Rå grid frem for EviStack: mellemrummet skal skrumpe med måleren, og
  // EviStacks gap er fast. ps-0: globals.css rykker lister i lister ind.
  return (
    <dl aria-live="polite" className="grid grid-cols-3 gap-1 ps-0 @2xs/meter:gap-2">
      {children}
    </dl>
  );
}

export type PlanioDemoStatProps = {
  label: React.ReactNode;
  /** Hvilket tal: dagens energi, det planlagte eller det, der er tilbage. */
  kind: "start" | "planned" | "left";
};

export function PlanioDemoStat({
  label,
  kind,
}: PlanioDemoStatProps): React.ReactElement {
  const { start, planned, left } = useDemo();
  const value =
    kind === "start"
      ? format_level(start)
      : kind === "planned"
        ? format_change(planned)
        : format_level(left);

  return (
    // aria-atomic: en ændring læses som "Tilbage 20%", ikke bare "20%".
    <div
      aria-atomic
      className={cn(
        "flex min-w-0 flex-col gap-0.5 rounded-evi px-2 py-2 @2xs/meter:px-3 @2xs/meter:py-2.5",
        kind === "left" ? "theme-primary" : "theme-light",
      )}
    >
      <dt className="text-xs leading-snug font-semibold wrap-break-word hyphens-auto">
        {label}
      </dt>
      <dd className="text-sm leading-snug font-bold tabular-nums @3xs/meter:text-base @2xs/meter:text-xl">
        {value}
      </dd>
    </div>
  );
}

export function PlanioDemoBattery(): React.ReactElement {
  const { start, left } = useDemo();
  const full = energy_segments(left);
  return (
    <PlanioEnergyBar
      filled={full}
      used={Math.max(energy_segments(start) - full, 0)}
      size="lg"
    />
  );
}

/**
 * Listen af dage. Mellem to dage en stiplet streg. Container, så rækkerne kan
 * lægge procenten under titlen, når listen er smal.
 */
export function PlanioDemoList({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div
      data-slot="planio-demo-list"
      className="theme-light @container/list min-w-0 rounded-evi px-3 py-2 sm:px-6 sm:py-3 @3xl/section:col-start-2 @3xl/section:row-span-2 @3xl/section:row-start-1 [&>fieldset+fieldset]:mt-1.5 [&>fieldset+fieldset]:border-t [&>fieldset+fieldset]:border-dashed [&>fieldset+fieldset]:border-current/25 [&>fieldset+fieldset]:pt-1"
    >
      {children}
    </div>
  );
}

/**
 * En dag som fieldset, så skærmlæsere hører dagen sammen med begivenheden.
 * Legenden flyder, ellers lægger browseren den hen over den stiplede kant.
 */
export function PlanioDemoDay({
  legend,
  children,
}: {
  legend: React.ReactNode;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <fieldset className="min-w-0 [&>legend+*]:clear-both">
      <legend className="float-left w-full pt-2.5 pb-0.5 text-sm">{legend}</legend>
      {children}
    </fieldset>
  );
}

export type PlanioDemoItemProps = {
  eventKey: string;
  title: string;
  time: string | null;
  energy: number;
};

export function PlanioDemoItem({
  eventKey,
  title,
  time,
  energy,
}: PlanioDemoItemProps): React.ReactElement {
  const { isChecked, toggle } = useDemo();

  // Smal liste: tid og procent deler linjen under titlen og folder, når der
  // ikke er plads, så titlen får hele bredden. Fra @xs/list bliver linjen
  // `contents`, og procenten står i sin egen kolonne til højre (designet).
  return (
    <label className="grid min-h-12 cursor-pointer grid-cols-[auto_1fr] items-center gap-x-3 border-b border-current/10 py-1.5 last:border-b-0 @xs/list:grid-cols-[auto_1fr_auto] @xs/list:gap-x-3.5 @3xl/section:min-h-15">
      <input
        type="checkbox"
        className="row-span-2 size-5"
        checked={isChecked(eventKey)}
        onChange={() => toggle(eventKey)}
      />
      <span className="min-w-0 font-bold wrap-break-word hyphens-auto">{title}</span>
      <span className="col-start-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 @xs/list:contents">
        {time && (
          <span className="text-xs font-semibold whitespace-nowrap @xs/list:col-start-2 @xs/list:row-start-2">
            {time}
          </span>
        )}
        <span
          className={cn(
            "text-sm font-bold whitespace-nowrap tabular-nums @xs/list:col-start-3 @xs/list:row-span-2 @xs/list:row-start-1 @xs/list:justify-self-end",
            energy > 0 && "theme-surface-primary rounded-full px-2.5 py-0.5",
          )}
        >
          {format_change(energy)}
        </span>
      </span>
    </label>
  );
}

/**
 * Statuslinjen. Vises kun, når den siger mere end tallene: i balance, over,
 * præcis nul eller i underskud. "{procent}" i skabelonen bliver til tallet.
 */
export function PlanioDemoStatus({
  templates,
  children,
}: {
  templates: PlanioDemoTemplates;
  children?: React.ReactNode;
}): React.ReactElement {
  const { start, left, anyToday } = useDemo();

  const template =
    left > start
      ? templates.over
      : left === start
        ? anyToday
          ? templates.balance
          : templates.start
        : left === 0
          ? templates.zero
          : left < 0
            ? templates.short
            : null;
  const sentence = template?.replaceAll(PERCENT_TOKEN, `${Math.abs(left)}%`);

  return (
    <div
      data-slot="planio-demo-status"
      aria-live="polite"
      className="flex flex-col gap-3 @3xl/section:col-start-1 @3xl/section:row-start-2"
    >
      {sentence && <div className="font-bold">{sentence}</div>}
      {children}
    </div>
  );
}

/** Noten om i morgen: kun når en begivenhed i morgen er valgt og energien er lav. */
export function PlanioDemoTomorrowNote({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement | null {
  const { tomorrowLow } = useDemo();
  if (!tomorrowLow) return null;
  return <div className="flex flex-col gap-1">{children}</div>;
}
