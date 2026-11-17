/**
 * Prismic-locale ("da-dk") → Open Graph-locale ("da_DK"). Open Graph kræver
 * sprog_OMRÅDE med understregning og stort område; ellers læses den ikke.
 */
export function og_locale(lang: string): string {
  const [language = "", region] = lang.toLowerCase().split("-");
  return region ? `${language}_${region.toUpperCase()}` : language;
}
