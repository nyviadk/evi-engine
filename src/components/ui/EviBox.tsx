import { cn } from "@/src/lib/utils/cn";
import { resolve_surface, NO_SURFACE } from "@/src/lib/utils/surface";

type BoxSize = "card" | "compact";

// Kasse-FORMEN (afrunding + luft + elevation) ét sted. Padding trappes i 3 trin:
// på en 332px-skærm ville 24px i hver side æde for meget. Samme skala bruges af
// bento + EviImage variant="framed" — hold dem synkroniserede.
const sizeClass: Record<BoxSize, string> = {
  card: "rounded-evi p-4 shadow-evi sm:p-6 md:p-8",
  compact: "rounded-evi p-3 sm:p-4 md:p-6",
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

/**
 * Flade + kasse-form for et Prismic farve-label — ELLER tom streng ved "Uden
 * farve" (ingen flade/padding/skygge, så indholdet flugter fladt frem for at være
 * mærkeligt indrykket). Layouts med stramme box-gaps (fx features-split) skal selv
 * øge gap'et ved "Uden farve" (via [[NO_SURFACE]]) så items stadig har luft.
 * Brug denne frem for `cn(resolve_surface(x), evi_box_class())`.
 */
export function box_surface(color?: string | null, size: BoxSize = "card"): string {
  if (color === NO_SURFACE) return "";
  return cn(resolve_surface(color), evi_box_class(size));
}

/**
 * Negative margener der modsvarer EviBox' card-padding → et `variant="plain"`-
 * billede bløder ud til kort-kanten frem for at sidde indrammet i paddingen.
 * Kræver `w-auto` (medtaget) + `overflow-hidden` på kortet.
 *
 * Reset til indrammet sættes af KALDEREN litteralt — Tailwind scanner kun statiske
 * strenge, så breakpoint-præfikset kan ikke interpoleres her:
 *   cn(evi_card_bleed_class("top"), "@3xl/section:m-0 @3xl/section:w-full @3xl/section:rounded-evi")
 */
export function evi_card_bleed_class(edge: "top" | "bottom"): string {
  return cn(
    "-mx-4 w-auto sm:-mx-6 md:-mx-8",
    edge === "top" ? "-mt-4 sm:-mt-6 md:-mt-8" : "-mb-4 sm:-mb-6 md:-mb-8",
  );
}

export type EviBoxProps = React.ComponentProps<"div"> & {
  /** Prismic farve-label ("Neutral"/"Primær"/"Sekundær"). @default "Neutral" */
  surface?: string | null;
  /** "card" = fremhævet (p-4→p-8 + skygge). "compact" = flad (p-3→p-6). @default "card" */
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
      className={cn(box_surface(surface, size), className)}
      {...props}
    />
  );
}
