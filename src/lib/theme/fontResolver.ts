const SYSTEM_FALLBACK =
  'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

// Specifikke vægte, IKKE range-syntaks.
function buildBunnyUrl(fontName: string): string {
  const slug = fontName.trim().replace(/\s+/g, "+");
  // swap: render-blocking stylesheet → font klar ved paint, vist på første load
  // uden hop. optional gav fallback + 2-reload på uncachet load.
  return `https://fonts.bunny.net/css?family=${slug}:300,400,500,600,700,800&display=swap`;
}

export interface FontConfig {
  /** CSS-variabel-klasse til <html> (altid "" — Bunny bruger ikke variabler) */
  htmlClass: string;
  /** Bunny preconnect + stylesheet links nødvendige */
  bunny: { preconnect: true; stylesheet: string } | null;
  /** Værdier til --evi-heading-font og --evi-body-font */
  headingFont: string;
  bodyFont: string;
}

/**
 * Resolver kundens font-valg fra Prismic settings.
 * Prioritet: custom_font_input → font_select → "System standard".
 *
 * Alle ikke-system-fonts hentes fra Bunny (render-blocking stylesheet → font
 * klar ved første paint, ingen FOUT/hop). Erstatter next/font-self-hosting, der
 * i vores runtime-valgte setup (én af mange fonts pr. tenant) enten gav hop
 * (swap) eller 2-reload (optional) — preload ville ramme alle fonts.
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

  const fontValue = `"${chosenName}", ${SYSTEM_FALLBACK}`;
  return {
    htmlClass: "",
    bunny: { preconnect: true, stylesheet: buildBunnyUrl(chosenName) },
    headingFont: fontValue,
    bodyFont: fontValue,
  };
}
