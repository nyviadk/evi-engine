import { type ReactNode } from "react";
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
  className,
  children,
  ...props
}: EviSplitProps): React.ReactElement {
  const cols = presetClasses[preset];
  const [first, second] = children;

  return (
    <div
      data-slot="evi-split"
      data-preset={preset}
      data-align={align}
      className={cn(
        "col-span-12 grid grid-cols-subgrid gap-y-8 md:gap-y-12",
        alignClasses[align],
        className,
      )}
      {...props}
    >
      <div className={cn(cols.left, align === "stretch" && "*:h-full")}>
        {first}
      </div>
      <div
        className={cn(
          cols.right,
          align === "stretch" && "*:h-full",
          // Kun VISUEL reorder via CSS `order` (DOM/læse-/fokus-rækkefølge er
          // uændret): løft 2. barn foran på mobil (mobileReverse) og/eller på
          // desktop (reverse). Ikke-reverse sætter eksplicit order-0 så en
          // mobil-reverse nulstilles korrekt ved @3xl.
          mobileReverse ? "order-first" : "order-0",
          reverse ? "@3xl/section:order-first" : "@3xl/section:order-0",
        )}
      >
        {second}
      </div>
    </div>
  );
}
