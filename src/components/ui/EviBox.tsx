import { cn } from "@/src/lib/utils/cn";
import { resolve_surface } from "@/src/lib/utils/surface";

type BoxSize = "card" | "compact";

// Kasse-FORMEN (afrunding + luft + elevation) ét sted.
// "card" = fremhævet kort/callout. "compact" = flad, tættere boks til lister.
//
// Padding trappes op i 3 trin i stedet for at springe: på en 332px-skærm er der
// kun ~300px indhold, og 24px luft i hver side åd for meget. Samme skala bruges
// af bento's billed-kasse + EviImage variant="framed" — hold dem synkroniserede.
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
 * Negative margener der PRÆCIST modsvarer EviBox' card-padding (p-4 sm:p-6
 * md:p-8) → et `variant="plain"`-billede kan bløde ud til kort-kanten i stedet
 * for at sidde som en indrammet plade i paddingen. `edge` vælger top- eller
 * bund-bleed (siderne bløder altid). Kræver `w-auto` (medtaget) + at kortet har
 * `overflow-hidden` (klipper billedet til de runde hjørner).
 *
 * Reset til indrammet ("m-0 w-full rounded-evi" ved container-bredden) sættes af
 * KALDEREN litteralt — Tailwind scanner kun statiske strenge, så breakpoint-
 * præfikset kan ikke interpoleres her:
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
      className={cn(resolve_surface(surface), evi_box_class(size), className)}
      {...props}
    />
  );
}
