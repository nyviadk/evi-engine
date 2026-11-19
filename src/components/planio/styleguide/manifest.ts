import type { EviContext } from "@/src/lib/prismic/context";
import {
  absolute_url,
  STYLEGUIDE_FILES,
  STYLEGUIDE_PATH,
  styleguide_file_path,
  type PartnerLogo,
  type PlanioBrand,
} from "@/src/components/planio/styleguide/brand";
import {
  brand_colors,
  contrast_pairs,
  corner_radius,
  LAYOUT_SPECS,
  muted_colors,
  shadows,
  SPACING,
  TYPE_SCALE,
} from "@/src/components/planio/styleguide/tokens";

export type LogoSources = { light: string | null; dark: string | null };

/**
 * Hele designguiden som JSON, inkl. logoernes SVG-kode, så et værktøj eller en
 * AI-assistent får alt i ét kald uden at læse siden eller følge links.
 */
export function build_manifest(
  ctx: EviContext,
  brand: PlanioBrand,
  logos: LogoSources,
  partners: PartnerLogo[],
): Record<string, unknown> {
  const url = (path: string) => absolute_url(ctx, path);
  const radius = corner_radius(brand.radius);

  const logo = (id: string, label: string, background: "light" | "dark", file: typeof STYLEGUIDE_FILES.logoLight | typeof STYLEGUIDE_FILES.logoDark, source: string | null) => ({
    id,
    label,
    background,
    formats: {
      svg: {
        url: url(styleguide_file_path(file)),
        filename: file,
        width: 389,
        height: 146,
        aspectRatio: 2.664,
        /** Hele SVG-filen, klar til at skrive til disk. */
        source,
      },
    },
  });

  return {
    name: brand.siteName,
    description: `Brand-manifest for ${brand.siteName}. Farver, logoer, app-ikon, typografi og spacing.`,
    numberFormat:
      "Alle mål er tal, ikke tekst. Enhederne står i units-felterne. Siden viser dem med dansk decimalkomma.",
    styleguide: url(STYLEGUIDE_PATH),
    updated: new Date().toISOString(),

    colors: brand_colors(brand.colors).map(({ id, name, hex, rgb, usage, token }) => ({
      id,
      name,
      hex,
      rgb: `rgb(${rgb})`,
      usage,
      token,
    })),

    mutedSurfaces: {
      basis:
        "To nedtonede flader. Ingen ekstra farver, kun grundfarverne blandet i baggrunden. Hex-værdien er den færdige farve til værktøjer uden farveblanding.",
      surfaces: muted_colors(brand.colors),
    },

    contrast: contrast_pairs(brand.colors).map((pair) => ({
      foreground: pair.foreground,
      background: pair.background,
      ratio: pair.ratio,
      ratioUnit: "kontrastforhold mod 1",
      wcagAA: pair.pass,
      recommendation: pair.pass ? "ok" : "avoid",
      note: pair.note,
    })),

    typography: {
      family: brand.font,
      download: `https://fonts.google.com/specimen/${encodeURIComponent(brand.font).replace(/%20/g, "+")}`,
      weights: [300, 400, 500, 600, 700],
      units: { web: "px", document: "pt", slide: "pt" },
      scale: TYPE_SCALE,
    },

    spacing: {
      basis: "Hele gange 8 px. Omregnet med 16 px = 12 pt = 0,42 cm.",
      units: { px: "px", pt: "pt", cm: "cm" },
      steps: SPACING,
    },

    logos: [
      logo("logo-light-background", "Logo til lys baggrund", "light", STYLEGUIDE_FILES.logoLight, logos.light),
      logo("logo-dark-background", "Logo til mørk baggrund", "dark", STYLEGUIDE_FILES.logoDark, logos.dark),
    ],

    appIcon: brand.appIcon && {
      url: url(styleguide_file_path(STYLEGUIDE_FILES.appIcon)),
      filename: STYLEGUIDE_FILES.appIcon,
      format: "png",
      width: brand.appIcon.size,
      height: brand.appIcon.size,
      note: "Kvadratisk uden afrundede hjørner. App Store, Google Play og telefonen runder selv hjørnerne.",
    },

    externalLogos: {
      note: "Partnere og samarbejder fra websitet, hentet live fra Prismic. Logoerne tilhører de enkelte organisationer og må ikke ændres.",
      zip: url(styleguide_file_path(STYLEGUIDE_FILES.partnerZip)),
      items: partners.map((p) => ({
        id: p.id,
        name: p.name,
        format: p.format.toLowerCase(),
        url: p.downloadUrl,
        filename: p.downloadName,
        width: p.width,
        height: p.height,
      })),
    },

    layouts: {
      basis: "Mål til dokumenter og præsentationer. Afstandene kommer fra spacing-skalaen; alle længder er i cm.",
      unit: "cm",
      specs: LAYOUT_SPECS,
    },

    effects: {
      cornerRadius: { px: radius.px, cm: radius.cm, token: radius.token },
      shadows: {
        note: "Værdierne passer til PowerPoints skygge-dialog: sløring, afstand og vinkel.",
        units: { blur: "px", distance: "px", angle: "grader", opacity: "%" },
        items: shadows(brand.colors.dark),
      },
    },

    usage: {
      preferredFormat: "Logoerne er SVG og kan skaleres frit. App-ikonet er PNG.",
      logoRule:
        "Vælg logo efter baggrunden: lys baggrund giver logoet med mørk tekst, mørk baggrund giver logoet med lys tekst.",
      clearSpace:
        "Hold mindst 0,42 cm (12 pt) fri luft rundt om logoet. Skalér aldrig logoet uproportionalt og ændr ikke farverne.",
    },
  };
}
