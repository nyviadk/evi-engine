const SYSTEM_FALLBACK =
  'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

// Selv-hostet (ikke Bunny/Google), så besøgendes IP ikke sendes til tredjepart.
// Filerne er variable woff2 fra Fontsource i public/fonts/<dir>/ med OFL.txt.
// Ny skrift: læg <subset>-wght-normal.woff2 + OFL.txt der, tilføj den her OG
// som option i settings-modellens font_select (via CLI).
const SELF_HOSTED_FONTS: Record<string, { dir: string; weights: string }> = {
  Comfortaa: { dir: "comfortaa", weights: "300 700" },
  "Plus Jakarta Sans": { dir: "plus-jakarta-sans", weights: "200 800" },
};

// unicode-range gør at latin-ext kun hentes, hvis teksten faktisk bruger dem.
const SUBSET_RANGES: Record<string, string> = {
  latin:
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
  "latin-ext":
    "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
};

export interface FontConfig {
  /** @font-face-regler til inline <style> i <head>. null = systemfont. */
  fontFaceCss: string | null;
  /** Latin-filen preloades, så tekst ikke først tegnes i fallback-fonten. */
  preloadHref: string | null;
  /** Værdier til --evi-heading-font og --evi-body-font */
  headingFont: string;
  bodyFont: string;
}

/** Ukendte navne (fx en gammel option fra før selv-hosting) giver systemfont. */
export function resolveFonts(settings: {
  font_select?: string | null;
}): FontConfig {
  const name = (settings.font_select ?? "").trim();
  const font = SELF_HOSTED_FONTS[name];

  if (!font) {
    return {
      fontFaceCss: null,
      preloadHref: null,
      headingFont: SYSTEM_FALLBACK,
      bodyFont: SYSTEM_FALLBACK,
    };
  }

  const base = `/fonts/${font.dir}`;
  const fontFaceCss = Object.entries(SUBSET_RANGES)
    .map(
      ([subset, range]) =>
        `@font-face{font-family:"${name}";font-style:normal;font-weight:${font.weights};font-display:swap;src:url(${base}/${subset}-wght-normal.woff2) format("woff2");unicode-range:${range}}`,
    )
    .join("");
  const fontValue = `"${name}", ${SYSTEM_FALLBACK}`;

  return {
    fontFaceCss,
    preloadHref: `${base}/latin-wght-normal.woff2`,
    headingFont: fontValue,
    bodyFont: fontValue,
  };
}
