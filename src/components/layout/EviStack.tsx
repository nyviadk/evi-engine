import { cn } from "@/src/lib/utils/cn";

type Gap = "xs" | "sm" | "md" | "lg" | "xl";
type Direction = "row" | "col";
type Align = "start" | "center" | "end" | "stretch" | "baseline";
type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";

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
  "as" | "gap" | "direction" | "wrap" | "align" | "justify"
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

/**
 * Layout primitive for flex-based stacking. Handles axis, gap, alignment,
 * and semantic element choice — so callers never write raw flex classes.
 *
 * Examples:
 *   <EviStack gap="md">                              → vertical <div>
 *   <EviStack as="ul" gap="sm">                      → vertical <ul>
 *   <EviStack direction="row" wrap gap="md">         → horizontal wrap row
 *   <EviStack as="nav" direction="row">              → semantic <nav>
 *   <EviStack direction="row" justify="between" align="center"> → toolbar
 *
 * Rule of thumb: if you find yourself writing any of `flex`, `flex-col`,
 * `flex-row`, `items-*`, `justify-*`, `gap-*` — you want EviStack.
 */
export function EviStack<T extends React.ElementType = "div">({
  as,
  gap = "md",
  direction = "col",
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
      data-direction={direction}
      className={cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        wrap && "flex-wrap",
        gapClasses[gap],
        align && alignClasses[align],
        justify && justifyClasses[justify],
        className,
      )}
      {...props}
    />
  );
}
