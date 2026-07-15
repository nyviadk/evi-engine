import { cn } from "@/src/lib/utils/cn";

type AutoGridSize = "sm" | "md" | "lg" | "quad" | "fluid";

export type EviAutoGridProps = React.ComponentProps<"div"> & {
  /**
   * Minimum child-bredde — driver hvor mange kolonner der passer pr.
   * container-bredde.
   *
   * - "sm" / "md" / "lg" — fixed container-query breakpoints (250/320/400px min)
   * - "quad" — 1 → 2 → 4 kolonner (springer 3 over), til fast 4-antal-layouts
   *   (fx trust-bar) så der aldrig efterlades en enlig kolonne på en række.
   * - "fluid" — CSS-native `auto-fit + minmax(180px, 1fr)`; columns fit as
   *   many as possible and wrap onto new rows without hardcoded breakpoints.
   *   Best for content lists where the exact column count doesn't matter
   *   (footer link columns, sponsor logos, etc.).
   */
  size: AutoGridSize;
};

// Pre-calculated breakpoints: minWidth × cols + 32px × (cols - 1)
// sm (250px): 2→532  3→814  4→1096  6→1660
// md (320px): 2→672  3→1024  4→1376
// lg (400px): 2→832  3→1264
const sizeClasses: Record<AutoGridSize, string> = {
  sm: "grid-cols-1 @[532px]/grid:grid-cols-2 @[814px]/grid:grid-cols-3 @[1096px]/grid:grid-cols-4 @[1660px]/grid:grid-cols-6",
  md: "grid-cols-1 @[672px]/grid:grid-cols-2 @[1024px]/grid:grid-cols-3 @[1376px]/grid:grid-cols-4",
  lg: "grid-cols-1 @[832px]/grid:grid-cols-2 @[1264px]/grid:grid-cols-3",
  // 1 → 2 → 4 (springer 3): 250px min, samme breakpoints som sm uden 3-kol-trin.
  quad: "grid-cols-1 @[532px]/grid:grid-cols-2 @[1096px]/grid:grid-cols-4",
  fluid: "grid-cols-[repeat(auto-fit,minmax(180px,1fr))]",
};

export function EviAutoGrid({
  size,
  className,
  children,
  ...props
}: EviAutoGridProps): React.ReactElement {
  return (
    <div
      data-slot="evi-autogrid"
      data-size={size}
      className="@container/grid col-span-12"
    >
      <div
        className={cn(
          "grid gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}
