import { cn } from "@/src/lib/utils/cn";
import { resolve_surface } from "@/src/lib/utils/surface";

type BoxSize = "card" | "compact";

// Kasse-FORMEN (afrunding + luft + elevation) ét sted.
// "card" = fremhævet kort/callout. "compact" = flad, tættere boks til lister.
const sizeClass: Record<BoxSize, string> = {
  card: "rounded-evi p-6 shadow-evi md:p-8",
  compact: "rounded-evi p-4 md:p-6",
};

/**
 * Kun kasse-FORMEN som klasse-streng (ingen flade) — til elementer der ikke kan
 * være en `EviBox`, men skal se ud som en. Typisk `EviCard` (som selv er et
 * subgrid) eller kort hvor farven kommer fra en `theme-*`-klasse frem for en
 * surface.
 *
 * @example <EviCard rows={3} className={cn(resolve_surface(color), evi_box_class())}>
 */
export function evi_box_class(size: BoxSize = "card"): string {
  return sizeClass[size];
}

export type EviBoxProps = React.ComponentProps<"div"> & {
  /** Prismic farve-label ("Neutral"/"Primær"/"Sekundær"). @default "Neutral" */
  surface?: string | null;
  /** "card" = fremhævet (p-6/md:p-8 + skygge). "compact" = flad (p-4/md:p-6). @default "card" */
  size?: BoxSize;
};

/**
 * EviBox — den delte "kasse": tematiseret flade + afrunding + luft (+ skygge).
 * Samler opskriften der før var kopieret i features/cards, features/split,
 * bento og highlights. Farve via `surface` (Prismic-label), form via `size`.
 */
export function EviBox({
  surface,
  size = "card",
  className,
  ...props
}: EviBoxProps): React.ReactElement {
  return (
    <div
      data-slot="evi-box"
      data-size={size}
      className={cn(resolve_surface(surface), evi_box_class(size), className)}
      {...props}
    />
  );
}
