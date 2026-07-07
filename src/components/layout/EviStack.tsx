import { cn } from "@/src/lib/utils/cn";

type Gap = "xs" | "sm" | "md" | "lg" | "xl";
type Direction = "row" | "col";

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
} & Omit<
  React.ComponentPropsWithoutRef<T>,
  "as" | "gap" | "direction" | "wrap"
>;

const gapClasses: Record<Gap, string> = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

/**
 * Layout primitive for flex-based stacking. Handles axis, gap, and semantic
 * element choice — so callers never write raw flex classes for the same
 * pattern in ten different places (which drifts as the design system evolves).
 *
 * Examples:
 *   <EviStack gap="md">                    → vertical <div>
 *   <EviStack as="ul" gap="sm">            → vertical <ul>, semantic list
 *   <EviStack direction="row" wrap gap="md"> → horizontal wrapping row
 *   <EviStack as="nav" direction="row">    → semantic <nav> horizontal
 *
 * Rule of thumb: if you find yourself writing `flex flex-col gap-X` or
 * `flex flex-row gap-X` anywhere, use EviStack instead.
 */
export function EviStack<T extends React.ElementType = "div">({
  as,
  gap = "md",
  direction = "col",
  wrap = false,
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
        className,
      )}
      {...props}
    />
  );
}
