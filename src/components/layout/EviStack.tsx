import { cn } from "@/src/lib/utils/cn";

type Gap = "xs" | "sm" | "md" | "lg" | "xl";
type Direction = "row" | "col";
type Align = "start" | "center" | "end" | "stretch" | "baseline";
type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";
/** Breakpoint hvor stakken skifter fra col (stakket) til row. */
type RowFrom = "md" | "@3xl/section";

export type EviStackProps<T extends React.ElementType = "div"> = {
  /** Underlying element. @default "div" — use "ul" / "ol" / "nav" for semantic lists. */
  as?: T;
  /** Space between children. @default "md" */
  gap?: Gap;
  /**
   * Layout axis. "col" = vertical stack (default), "row" = horizontal.
   * "row" respects `wrap` when children can't fit on one line.
   */
  direction?: Direction;
  /**
   * Responsiv retning: stakket (col) UNDER breakpointet, række (row) PÅ/OVER —
   * overstyrer `direction`. `align`/`justify` gælder da RÆKKE-tilstanden (påføres
   * ved breakpointet); col-tilstanden er en almindelig lodret stak. Til fx
   * "label | værdi"-rækker der stakker på smalle kort. Enum frem for vilkårligt
   * breakpoint fordi Tailwind kun scanner literal-klasser — udvid tabellerne.
   */
  rowFrom?: RowFrom;
  /** When direction="row", wrap onto new lines instead of overflowing. @default false */
  wrap?: boolean;
  /**
   * Cross-axis alignment (perpendicular to `direction`). "start" for text,
   * "center" for aligned rows, "stretch" for full-width children.
   */
  align?: Align;
  /**
   * Main-axis distribution (along `direction`). "between" for pushing
   * items to opposite ends, "center" for centered content.
   */
  justify?: Justify;
} & Omit<
  React.ComponentPropsWithoutRef<T>,
  "as" | "gap" | "direction" | "rowFrom" | "wrap" | "align" | "justify"
>;

const gapClasses: Record<Gap, string> = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

const alignClasses: Record<Align, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const justifyClasses: Record<Justify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

// Responsiv retning (rowFrom). Tailwind scanner kun literal-strenge, så
// breakpoint-præfikset kan ikke interpoleres — derfor én entry pr. (breakpoint,
// værdi). Tilføj nye breakpoints ved at udvide alle tre tabeller.
const rowFromClasses: Record<RowFrom, string> = {
  md: "flex-col md:flex-row",
  "@3xl/section": "flex-col @3xl/section:flex-row",
};
const rowFromAlignClasses: Record<RowFrom, Record<Align, string>> = {
  md: {
    start: "md:items-start",
    center: "md:items-center",
    end: "md:items-end",
    stretch: "md:items-stretch",
    baseline: "md:items-baseline",
  },
  "@3xl/section": {
    start: "@3xl/section:items-start",
    center: "@3xl/section:items-center",
    end: "@3xl/section:items-end",
    stretch: "@3xl/section:items-stretch",
    baseline: "@3xl/section:items-baseline",
  },
};
const rowFromJustifyClasses: Record<RowFrom, Record<Justify, string>> = {
  md: {
    start: "md:justify-start",
    center: "md:justify-center",
    end: "md:justify-end",
    between: "md:justify-between",
    around: "md:justify-around",
    evenly: "md:justify-evenly",
  },
  "@3xl/section": {
    start: "@3xl/section:justify-start",
    center: "@3xl/section:justify-center",
    end: "@3xl/section:justify-end",
    between: "@3xl/section:justify-between",
    around: "@3xl/section:justify-around",
    evenly: "@3xl/section:justify-evenly",
  },
};

/**
 * Layout primitive for flex-based stacking (axis, gap, alignment, semantic
 * element) — so callers never write raw flex classes.
 *
 * Examples:
 *   <EviStack as="ul" gap="sm">                      → vertical <ul>
 *   <EviStack direction="row" wrap gap="md">         → horizontal wrap row
 *   <EviStack direction="row" justify="between" align="center"> → toolbar
 */
export function EviStack<T extends React.ElementType = "div">({
  as,
  gap = "md",
  direction = "col",
  rowFrom,
  wrap = false,
  align,
  justify,
  className,
  ...props
}: EviStackProps<T>): React.ReactElement {
  const Component = (as || "div") as React.ElementType;
  return (
    <Component
      data-slot="evi-stack"
      data-direction={rowFrom ? "responsive" : direction}
      className={cn(
        "flex",
        rowFrom
          ? rowFromClasses[rowFrom]
          : direction === "row"
            ? "flex-row"
            : "flex-col",
        wrap && "flex-wrap",
        gapClasses[gap],
        align &&
          (rowFrom ? rowFromAlignClasses[rowFrom][align] : alignClasses[align]),
        justify &&
          (rowFrom
            ? rowFromJustifyClasses[rowFrom][justify]
            : justifyClasses[justify]),
        className,
      )}
      {...props}
    />
  );
}
