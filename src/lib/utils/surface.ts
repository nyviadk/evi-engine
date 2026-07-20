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
const NEUTRAL = "theme-surface-neutral";
const PRIMARY = "theme-surface-primary";

const SURFACE_MAP: Record<string, string> = {
  Neutral: NEUTRAL,
  Primær: PRIMARY,
  Sekundær: "theme-surface-secondary",
};

/** Flade-klassen for et label. Ukendt/tomt → neutral. */
export function resolve_surface(label?: string | null): string {
  return SURFACE_MAP[label ?? "Neutral"] ?? NEUTRAL;
}

/**
 * Kontrast-flade til et element der ligger PÅ en surface (fx en ikon-cirkel).
 * Skifter til neutral på tintede flader, så cirklen ikke smelter sammen med
 * fladen — og til primær når fladen selv er neutral.
 */
export function resolve_surface_contrast(label?: string | null): string {
  return (label ?? "Neutral") === "Neutral" ? PRIMARY : NEUTRAL;
}

// Telefon-boks-fladen (PhoneMockup) har en større label-mængde end de tre
// standard-tints — Lys/Mørk + en solid/gradient-fill. Egen map, samme hjem, så
// al flade-opløsning ligger ét sted.
const PHONE_NEUTRAL = {
  solid: "theme-surface-neutral",
  gradient: "theme-surface-neutral-gradient",
};

const PHONE_SURFACE_MAP: Record<string, { solid: string; gradient: string }> = {
  Neutral: PHONE_NEUTRAL,
  Lys: { solid: "theme-surface-light", gradient: "theme-surface-light-gradient" },
  Mørk: { solid: "theme-surface-dark", gradient: "theme-surface-dark-gradient" },
  "Primær tint": {
    solid: "theme-surface-primary",
    gradient: "theme-surface-primary-gradient",
  },
  "Sekundær tint": {
    solid: "theme-surface-secondary",
    gradient: "theme-surface-secondary-gradient",
  },
  Ingen: { solid: "", gradient: "" },
};

/** Telefon-boks-flade for et (flade-label, fill-label)-par. Fill default gradient. */
export function resolve_phone_surface(
  surface?: string | null,
  fill?: string | null,
): string {
  const entry = PHONE_SURFACE_MAP[surface ?? "Neutral"] ?? PHONE_NEUTRAL;
  return fill === "Solid" ? entry.solid : entry.gradient;
}
