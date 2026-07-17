/**
 * Prismic farve-label → `theme-surface-*`-klasse.
 *
 * Samler det mønster der før var kopieret som `BOX_SURFACE`/`CARD_SURFACE` i
 * hver enkelt slice-part. Surfaces er kontrast-adaptive brand-tints (bløde på
 * lys, dæmpede på mørk) — IKKE `theme-*-soft` (solid lys → grelt på mørke
 * sektioner).
 *
 * Labels ER Prismic Select-optionerne — hold dem synk'et med modellerne
 * (`--option "Neutral" --option "Primær" --option "Sekundær"`).
 */
const SURFACE_MAP: Record<string, string> = {
  Neutral: "theme-surface-neutral",
  Primær: "theme-surface-primary",
  Sekundær: "theme-surface-secondary",
};

/** Flade-klassen for et label. Ukendt/tomt → neutral. */
export function resolve_surface(label?: string | null): string {
  return SURFACE_MAP[label ?? "Neutral"] ?? SURFACE_MAP.Neutral;
}

/**
 * Kontrast-flade til et element der ligger PÅ en surface (fx en ikon-cirkel).
 * Skifter til neutral på tintede flader, så cirklen ikke smelter sammen med
 * fladen — og til primær når fladen selv er neutral.
 */
export function resolve_surface_contrast(label?: string | null): string {
  return (label ?? "Neutral") === "Neutral"
    ? SURFACE_MAP.Primær
    : SURFACE_MAP.Neutral;
}
