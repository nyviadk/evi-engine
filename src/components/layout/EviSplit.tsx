import { type ReactNode } from "react";
import { EVI_ROW_SPAN, type EviCardRows } from "@/src/components/ui/EviCard";
import { cn } from "@/src/lib/utils/cn";

type SplitPreset = "50-50" | "60-40" | "40-60" | "33-67" | "67-33";
type SplitAlign = "start" | "center" | "end" | "stretch";

export type EviSplitProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Forhold mellem venstre og højre pane (på desktop). */
  preset: SplitPreset;
  /** Vertikal alignment af pane-indholdet. @default "stretch" */
  align?: SplitAlign;
  /**
   * Byt panernes VISUELLE rækkefølge på desktop (2. barn vises til venstre) uden
   * at ændre DOM-/læse-rækkefølgen → a11y (fokus/skærmlæser) bevares. Læg det
   * primære indhold som 1. barn og styr fx billed-siden med denne. @default false
   */
  reverse?: boolean;
  /**
   * Byt panernes VISUELLE rækkefølge på mobil (stacked): 2. barn vises øverst.
   * DOM-rækkefølgen er uændret (a11y-sikkert). @default false
   */
  mobileReverse?: boolean;
  /**
   * Række-align panernes indhold: begge paner deler N række-spor, så fx titel og
   * tekst flugter på tværs af panerne selv når de har forskellig BREDDE (et
   * 67/33-par wrapper titlen forskelligt — uden det starter teksten i to højder).
   *
   * Kræver at hvert pane-barn selv er et subgrid med SAMME antal rækker, dvs.
   * `<EviCard rows={N}>`. Implicerer `align="stretch"` (rækkerne ER højden).
   */
  rows?: EviCardRows;
  /** Præcis 2 børn i DOM-/læse-rækkefølge — led med det primære indhold. */
  children: [ReactNode, ReactNode];
};

const presetClasses: Record<SplitPreset, { left: string; right: string }> = {
  "50-50": {
    left: "col-span-12 @3xl/section:col-span-6",
    right: "col-span-12 @3xl/section:col-span-6",
  },
  "60-40": {
    left: "col-span-12 @3xl/section:col-span-7",
    right: "col-span-12 @3xl/section:col-span-5",
  },
  "40-60": {
    left: "col-span-12 @3xl/section:col-span-5",
    right: "col-span-12 @3xl/section:col-span-7",
  },
  "33-67": {
    left: "col-span-12 @3xl/section:col-span-4",
    right: "col-span-12 @3xl/section:col-span-8",
  },
  "67-33": {
    left: "col-span-12 @3xl/section:col-span-8",
    right: "col-span-12 @3xl/section:col-span-4",
  },
};

const alignClasses: Record<SplitAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

export function EviSplit({
  preset,
  align = "stretch",
  reverse = false,
  mobileReverse = false,
  rows,
  className,
  children,
  ...props
}: EviSplitProps): React.ReactElement {
  const cols = presetClasses[preset];
  const [first, second] = children;
  const effectiveAlign = rows ? "stretch" : align;

  // Række-align: hvert pane subgrider splittens rækker og videregiver dem til sit
  // EviCard, så børnenes rækker flugter. `gap-0` dræber row-gap'et INDE i panet
  // (ellers skiller det også titel fra tekst); gap'et MELLEM panerne overlever.
  const paneRows = rows
    ? cn("grid grid-rows-subgrid gap-0", EVI_ROW_SPAN[rows])
    : undefined;

  return (
    <div
      data-slot="evi-split"
      data-preset={preset}
      data-align={effectiveAlign}
      data-rows={rows}
      className={cn(
        "col-span-12 grid grid-cols-subgrid gap-y-8 md:gap-y-12",
        alignClasses[effectiveAlign],
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          cols.left,
          !rows && align === "stretch" && "*:h-full",
          paneRows,
        )}
      >
        {first}
      </div>
      <div
        className={cn(
          cols.right,
          !rows && align === "stretch" && "*:h-full",
          paneRows,
          // Kun VISUEL reorder via CSS `order` (DOM/fokus-rækkefølge uændret).
          // Eksplicit order-0 så en mobil-reverse nulstilles korrekt ved @3xl.
          mobileReverse ? "order-first" : "order-0",
          reverse ? "@3xl/section:order-first" : "@3xl/section:order-0",
        )}
      >
        {second}
      </div>
    </div>
  );
}
