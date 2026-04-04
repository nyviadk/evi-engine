import { localFontMap } from "@/src/lib/fonts";

const SYSTEM_FALLBACK =
  'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

// Case-insensitive lookup i localFontMap
function findLocalFont(name: string) {
  const normalized = name.trim().toLowerCase();
  for (const [key, value] of Object.entries(localFontMap)) {
    if (key.toLowerCase() === normalized) return value;
  }
  return null;
}

// Byg Bunny Fonts URL med specifikke vægte (IKKE range-syntaks)
function buildBunnyUrl(fontName: string): string {
  const slug = fontName.trim().replace(/\s+/g, "+");
  return `https://fonts.bunny.net/css?family=${slug}:300,400,500,600,700,800&display=swap`;
}

export interface FontConfig {
  /** CSS-variabel-klasse til <html> (tom string hvis Bunny) */
  htmlClass: string;
  /** Bunny preconnect + stylesheet links nødvendige */
  bunny: { preconnect: true; stylesheet: string } | null;
  /** Værdier til --evi-heading-font og --evi-body-font */
  headingFont: string;
  bodyFont: string;
}

/**
 * Resolver kundens font-valg fra Prismic settings.
 * Prioritet: custom_font_input → font_select → "System standard"
 *
 * Hvis kunden skriver en lokal font (fx "Inter") i custom-feltet,
 * bruges den lokale next/font version i stedet for Bunny.
 */
export function resolveFonts(settings: {
  custom_font_input?: string | null;
  font_select?: string | null;
}): FontConfig {
  const customInput = (settings.custom_font_input ?? "").trim();
  const selectValue = (settings.font_select ?? "").trim();
  const chosenName = customInput || selectValue || "System standard";

  if (chosenName === "System standard") {
    return {
      htmlClass: "",
      bunny: null,
      headingFont: SYSTEM_FALLBACK,
      bodyFont: SYSTEM_FALLBACK,
    };
  }

  const localMatch = findLocalFont(chosenName);

  if (localMatch) {
    const fontValue = `${localMatch.name}, ${SYSTEM_FALLBACK}`;
    return {
      htmlClass: localMatch.class,
      bunny: null,
      headingFont: fontValue,
      bodyFont: fontValue,
    };
  }

  // Custom font fra Bunny Fonts med solid system-fallback
  const safeName = `"${chosenName}"`;
  const fontValue = `${safeName}, ${SYSTEM_FALLBACK}`;
  const bunnyUrl = buildBunnyUrl(chosenName);
  return {
    htmlClass: "",
    bunny: {
      preconnect: true,
      stylesheet: bunnyUrl,
    },
    headingFont: fontValue,
    bodyFont: fontValue,
  };
}
