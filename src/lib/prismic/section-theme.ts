/**
 * Dansk Prismic-label → CSS-tema-nøgle for `EviSection`.
 *
 * Alle slices (og komponenter som `FooterClassic`) bruger samme mapping via
 * `resolve_section_theme`. Kilde: `.theme-<key>`-reglerne i `app/globals.css`.
 *
 * Pattern for at tilføje ny tema-mulighed:
 *   1. Definér `.theme-<key>` i `globals.css` (token-cascade)
 *   2. Tilføj `label: "<key>"` her
 *   3. Tilføj samme `--option "<label>"` i alle Prismic-typer med tema-felt
 *      (fx `prismic field add select background_theme --option ...`)
 *
 * Prismic Select-feltets `option`-strings ER labels her — hold dem synk'et.
 */
const SECTION_THEME_MAP = {
  Lys: "light",
  Mørk: "dark",
  Primær: "primary",
  Sekundær: "secondary",
  "Mørk blød": "dark-soft",
  "Primær blød": "primary-soft",
  "Sekundær blød": "secondary-soft",
} as const;

export type SectionThemeLabel = keyof typeof SECTION_THEME_MAP;
export type SectionThemeKey = (typeof SECTION_THEME_MAP)[SectionThemeLabel];

/**
 * Slår et Prismic-label op og returnerer den tilsvarende CSS-tema-nøgle.
 * Ukendt/tomt label falder tilbage til `fallback` (default "light").
 */
export function resolve_section_theme(
  label: string | null | undefined,
  fallback: SectionThemeKey = "light",
): string {
  if (!label) return fallback;
  return SECTION_THEME_MAP[label as SectionThemeLabel] ?? fallback;
}
