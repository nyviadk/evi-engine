import { cn } from "@/src/lib/utils/cn";

type Padding = "none" | "sm" | "md" | "lg";
type Divider = "none" | "top" | "bottom";

export type EviRowProps = React.ComponentProps<"div"> & {
  /** Top or bottom border separator using theme-tinted current color. @default "none" */
  divider?: Divider;
  /** Padding on the divider side (or all sides if divider="none"). @default "none" */
  padding?: Padding;
  /**
   * Gør rækken til et eget 12-kol grid (i stedet for et fuld-bredde blok-slot), så
   * en nested `EviSplit` kan subgride på DEN (ikke sektionens grid) og børn kan
   * `col-span`'e — fx når man selv vil styre `gap-y`. Gap sættes via `className`.
   * @default false
   */
  grid?: boolean;
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
 * Full-width (`col-span-12`) slot inside an EviSection's 12-col grid, with
 * optional divider + padding — so slice files never write those classes themselves.
 */
export function EviRow({
  divider = "none",
  padding = "none",
  grid = false,
  className,
  ...props
}: EviRowProps): React.ReactElement {
  return (
    <div
      data-slot="evi-row"
      data-divider={divider}
      className={cn(
        "col-span-12",
        grid && "grid grid-cols-12",
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
