import { contrast_between, mix_oklch } from "@/src/lib/theme/colors";

/**
 * My Planios designguide: Evis mål omregnet til Word og PowerPoint, som ikke kan
 * regne i rem. Grundstørrelsen er 16 px = 12 pt = 0,42 cm.
 */

const PT_PER_PX = 0.75;
const CM_PER_PX = 2.54 / 96;

const round = (value: number, decimals: number) =>
  Math.round(value * 10 ** decimals) / 10 ** decimals;

export const px_to_pt = (px: number): number => round(px * PT_PER_PX, 2);
export const px_to_cm = (px: number): number => round(px * CM_PER_PX, 2);

/** Tallene er tal i manifestet; decimalkommaet er kun til visning på siden. */
export function da(value: number): string {
  return String(value).replace(".", ",");
}

export type SpacingStep = {
  name: string;
  px: number;
  pt: number;
  cm: number;
  /** Tailwind-klasserne i koden, som trinnet kommer fra. */
  token: string;
  usage: string;
};

function step(name: string, px: number, token: string, usage: string): SpacingStep {
  return { name, px, pt: px_to_pt(px), cm: px_to_cm(px), token, usage };
}

/** Evis afstande. Alle er hele gange 8 px. */
export const SPACING: SpacingStep[] = [
  step("XS", 8, "gap-2", "Mellem ikon og tekst, mellem label og værdi."),
  step("S", 16, "gap-4 · p-4", "Indvendig luft i knapper, felter og små kort. Mellem afsnit."),
  step("M", 24, "gap-6 · p-6", "Mellem elementer i samme gruppe."),
  step("L", 32, "gap-8 · p-8", "Mellem kort i et grid. Indvendig luft i store kort."),
  step("XL", 64, "gap-16", "Mellem kolonner og mellem blokke i en sektion."),
  step("2XL", 128, "py-32", "Mellem hovedsektioner. Sidens grundrytme."),
];

function by_name(name: string): SpacingStep {
  const found = SPACING.find((s) => s.name === name);
  if (!found) throw new Error(`Ukendt spacing-trin: ${name}`);
  return found;
}

export type TypeStep = {
  role: string;
  /** Mindste og største størrelse på web i px; skriften vokser med skærmen. */
  webMinPx: number;
  webMaxPx: number;
  /** Anbefalet størrelse i et A4-dokument, i pt. */
  docPt: number;
  /** Anbefalet størrelse på en 16:9-slide, i pt. */
  slidePt: number;
  lineHeight: number;
  weight: number;
  weightName: string;
};

/** Fra .evi-prose i globals.css (tekststørrelse "Standard"). */
export const TYPE_SCALE: TypeStep[] = [
  { role: "Titel (H1)", webMinPx: 32, webMaxPx: 61, docPt: 30, slidePt: 36, lineHeight: 1.15, weight: 700, weightName: "Bold" },
  { role: "Overskrift (H2)", webMinPx: 26, webMaxPx: 49, docPt: 22, slidePt: 28, lineHeight: 1.15, weight: 700, weightName: "Bold" },
  { role: "Underoverskrift (H3)", webMinPx: 22, webMaxPx: 39, docPt: 16, slidePt: 22, lineHeight: 1.2, weight: 700, weightName: "Bold" },
  { role: "Mellemrubrik (H4)", webMinPx: 20, webMaxPx: 31, docPt: 13, slidePt: 20, lineHeight: 1.25, weight: 700, weightName: "Bold" },
  { role: "Brødtekst", webMinPx: 16, webMaxPx: 16, docPt: 11, slidePt: 18, lineHeight: 1.6, weight: 400, weightName: "Regular" },
  { role: "Note / billedtekst", webMinPx: 14, webMaxPx: 14, docPt: 9, slidePt: 12, lineHeight: 1.4, weight: 400, weightName: "Regular" },
];

export const FONT_WEIGHTS = "300 Light · 400 Regular · 500 Medium · 600 SemiBold · 700 Bold";

export type SpecEntry = {
  label: string;
  display: string;
  /** Selve målet i cm, når posten er et mål. */
  cm?: number;
  /** Trinnet i spacing-skalaen, målet kommer fra. */
  step?: string;
};

export type LayoutSpec = {
  id: string;
  title: string;
  widthCm: number;
  heightCm: number;
  contentWidthCm: number;
  contentHeightCm: number;
  entries: SpecEntry[];
};

function spacing_entry(label: string, name: string): SpecEntry {
  const s = by_name(name);
  return { label, display: `${s.name} · ${da(s.cm)} cm`, cm: s.cm, step: s.name };
}

const SLIDE = { width: 33.87, height: 19.05 };
const SLIDE_MARGIN = by_name("XL").cm;
const SLIDE_CONTENT = {
  width: round(SLIDE.width - 2 * SLIDE_MARGIN, 2),
  height: round(SLIDE.height - 2 * SLIDE_MARGIN, 2),
};

/** Mål til dokumenter og præsentationer; afstandene kommer fra SPACING. */
export const LAYOUT_SPECS: LayoutSpec[] = [
  {
    id: "document-a4",
    title: "Dokument · A4",
    widthCm: 21,
    heightCm: 29.7,
    contentWidthCm: 16,
    contentHeightCm: 24.7,
    entries: [
      { label: "Sidestørrelse", display: "21 × 29,7 cm (stående)" },
      { label: "Margen hele vejen rundt", display: "2,5 cm (minimum 2,0 cm)", cm: 2.5 },
      { label: "Maks. tekstbredde", display: "16 cm – ca. 70 tegn pr. linje", cm: 16 },
      spacing_entry("Afstand mellem afsnit", "S"),
      spacing_entry("Afstand efter overskrift", "XS"),
      spacing_entry("Afstand før overskrift", "L"),
      spacing_entry("Afstand mellem sektioner", "XL"),
      { label: "Logo i sidehoved", display: "3 cm bred, øverst til venstre", cm: 3 },
    ],
  },
  {
    id: "presentation-16-9",
    title: "Præsentation · 16:9",
    widthCm: SLIDE.width,
    heightCm: SLIDE.height,
    contentWidthCm: SLIDE_CONTENT.width,
    contentHeightCm: SLIDE_CONTENT.height,
    entries: [
      { label: "Slidestørrelse", display: `${da(SLIDE.width)} × ${da(SLIDE.height)} cm (PowerPoint-standard)` },
      spacing_entry("Sikkerhedsmargen fra alle kanter", "XL"),
      { label: "Indholdsområde", display: `${da(SLIDE_CONTENT.width)} × ${da(SLIDE_CONTENT.height)} cm` },
      spacing_entry("Afstand titel → indhold", "L"),
      spacing_entry("Afstand mellem kolonner", "L"),
      spacing_entry("Afstand mellem bullets", "S"),
      { label: "Logo på slide", display: "3 cm bred, nederst til højre", cm: 3 },
      { label: "Maks. pr. slide", display: "6 bullets · ca. 12 ord pr. bullet" },
    ],
  },
];

export type ShadowSpec = {
  name: string;
  color: string;
  opacityPercent: number;
  blurPx: number;
  distancePx: number;
  angleDegrees: number;
  /** Klassen i globals.css. */
  token: string;
};

/** .shadow-evi og .shadow-evi-lg; den største af deres to lag, så PowerPoint kan gengive dem. */
export function shadows(dark: string): ShadowSpec[] {
  return [
    { name: "Standard", color: dark, opacityPercent: 11, blurPx: 12, distancePx: 4, angleDegrees: 90, token: "shadow-evi" },
    { name: "Fremhævet", color: dark, opacityPercent: 15, blurPx: 24, distancePx: 10, angleDegrees: 90, token: "shadow-evi-lg" },
  ];
}

export type CornerRadius = { px: number; cm: number; token: string; label: string };

/** "1rem" → 16 px. Pilleformen (9999px) har intet fast mål. */
export function corner_radius(css: string): CornerRadius {
  const px = css.endsWith("rem") ? parseFloat(css) * 16 : parseFloat(css) || 0;
  if (px >= 9999) return { px, cm: 0, token: "rounded-evi", label: "Fuld afrunding (pilleform)" };
  return { px, cm: px_to_cm(px), token: "rounded-evi", label: `${px} px · ${da(px_to_cm(px))} cm` };
}

export type BrandColors = {
  light: string;
  dark: string;
  primary: string;
  secondary: string;
};

export type ColorSpec = {
  id: string;
  name: string;
  usage: string;
  hex: string;
  rgb: string;
  /** Hvordan en nedtonet farve er blandet. */
  recipe?: string;
  /** Klassen i koden. */
  token: string;
};

export function hex_to_rgb_string(hex: string): string {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",");
}

function color(id: string, name: string, hex: string, token: string, usage: string): ColorSpec {
  const upper = hex.toUpperCase();
  return { id, name, usage, hex: upper, rgb: hex_to_rgb_string(upper), token };
}

export function brand_colors(c: BrandColors): ColorSpec[] {
  const list = [
    color("primary", "Primær", c.primary, "bg-evi-primary", "Knapper, fremhævninger og accenter. Ikke brødtekst på lys baggrund."),
    color("background", "Baggrund", c.light, "bg-evi-light", "Sidens grundflade og lyse felter."),
    color("text", "Tekst", c.dark, "bg-evi-dark", "Brødtekst og overskrifter. Grundflade på mørke layouts."),
  ];
  if (c.secondary.toUpperCase() !== c.primary.toUpperCase()) {
    list.splice(1, 0, color("secondary", "Sekundær", c.secondary, "bg-evi-secondary", "Sekundære knapper og accenter."));
  }
  return list;
}

/** De nedtonede flader (theme-*-soft): 10 % af farven blandet i baggrunden. */
export function muted_colors(c: BrandColors): ColorSpec[] {
  return [
    {
      ...color("muted-primary", "Nedtonet primær", mix_oklch(c.light, c.primary, 0.1), "theme-primary-soft", "Vores tonede flade. Infobokse, citater og fremhævede sektioner. Den mørke tekstfarve kan læses ovenpå."),
      recipe: "10 % primærfarve blandet i baggrundsfarven",
    },
    {
      ...color("muted-dark", "Nedtonet mørk", mix_oklch(c.light, c.dark, 0.1), "theme-dark-soft", "Neutral flade, når den tonede bliver for meget. Kort og felter, der skal træde en anelse frem."),
      recipe: "10 % tekstfarve blandet i baggrundsfarven",
    },
  ];
}

export type ContrastPair = {
  label: string;
  foreground: string;
  background: string;
  /** Kontrastforhold mod 1, med én decimal. */
  ratio: number;
  /** Klarer WCAG AA for brødtekst (4,5:1). */
  pass: boolean;
  note: string;
};

type PairSpec = {
  label: string;
  fg: keyof BrandColors;
  bg: keyof BrandColors;
  ok: string;
  avoid: string;
};

const AVOID_TEXT = "Undgå til tekst. Fungerer fint til flader, streger, ikoner og grafik.";

const PAIRS: PairSpec[] = [
  { label: "Mørk tekst på lys baggrund", fg: "dark", bg: "light", ok: "Standard. Brug denne til al brødtekst på lyse flader.", avoid: AVOID_TEXT },
  { label: "Lys tekst på mørk baggrund", fg: "light", bg: "dark", ok: "Standard på mørke flader og slides.", avoid: AVOID_TEXT },
  { label: "Primær på mørk baggrund", fg: "primary", bg: "dark", ok: "Må gerne bruges til tekst og tal på mørke flader.", avoid: AVOID_TEXT },
  { label: "Mørk tekst på primær flade", fg: "dark", bg: "primary", ok: "Brug denne kombination på knapper og fremhævede felter.", avoid: AVOID_TEXT },
  { label: "Primær på lys baggrund", fg: "primary", bg: "light", ok: "Må gerne bruges til tekst på lyse flader.", avoid: AVOID_TEXT },
  {
    label: "Lys tekst på primær flade",
    fg: "light",
    bg: "primary",
    ok: "Må gerne bruges til tekst på primære flader.",
    avoid: "Undgå til brødtekst og længere afsnit. Til korte, store elementer – knaptekst, overskrifter, tal – kan det godt være det rigtige valg.",
  },
];

/** WCAG 2.1: AA kræver 4,5:1 for brødtekst og 3:1 for stor tekst. */
export function contrast_pairs(c: BrandColors): ContrastPair[] {
  return PAIRS.map((p) => {
    const raw = contrast_between(c[p.fg], c[p.bg]);
    // Afrundet først til visning: 4,46 må ikke blive til en bestået 4,5.
    const pass = raw >= 4.5;
    return {
      label: p.label,
      foreground: c[p.fg].toUpperCase(),
      background: c[p.bg].toUpperCase(),
      ratio: round(raw, 1),
      pass,
      note: pass ? p.ok : p.avoid,
    };
  });
}
