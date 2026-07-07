import { cn } from "@/src/lib/utils/cn";

type Padding = "none" | "sm" | "md" | "lg";
type Divider = "none" | "top" | "bottom";

export type EviRowProps = React.ComponentProps<"div"> & {
  /** Top or bottom border separator using theme-tinted current color. @default "none" */
  divider?: Divider;
  /** Padding on the divider side (or all sides if divider="none"). @default "none" */
  padding?: Padding;
};

const paddingTop: Record<Padding, string> = {
  none: "",
  sm: "pt-3",
  md: "pt-6",
  lg: "pt-8",
};

const paddingBottom: Record<Padding, string> = {
  none: "",
  sm: "pb-3",
  md: "pb-6",
  lg: "pb-8",
};

/**
 * Full-width grid slot for placing content inside an EviSection's 12-col grid.
 * Handles the `col-span-12` placement + optional top/bottom divider + optional
 * padding — so slice files never write `col-span-12`, `border-t`, or `pt-*`
 * classes themselves.
 *
 * Use for footer bottom bars, section separators, cross-cutting bands, etc.
 *
 * Examples:
 *   <EviRow>{...}</EviRow>                        → full-width plain
 *   <EviRow divider="top" padding="md">{...}</EviRow>  → separated bottom band
 */
export function EviRow({
  divider = "none",
  padding = "none",
  className,
  ...props
}: EviRowProps): React.ReactElement {
  return (
    <div
      data-slot="evi-row"
      data-divider={divider}
      className={cn(
        "col-span-12",
        divider === "top" && "border-t border-current/10",
        divider === "bottom" && "border-b border-current/10",
        divider === "top" ? paddingTop[padding] : "",
        divider === "bottom" ? paddingBottom[padding] : "",
        divider === "none" &&
          padding !== "none" &&
          `${paddingTop[padding]} ${paddingBottom[padding]}`,
        className,
      )}
      {...props}
    />
  );
}
