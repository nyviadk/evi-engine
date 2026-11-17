/** Side-URL → sprog → URL til siden på det sprog. Kun sprog, siden findes på. */
export type LanguageMap = Record<string, Record<string, string>>;

function decode(path: string): string {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

/**
 * Sprogversionerne af siden på `pathname` (browserens sti). En sti uden
 * sprog-præfiks, som Evi rewriter til `lang`, slås op med præfikset.
 * Tomt, når siden ikke kendes (fx en sprog-fallback eller 404).
 */
export function page_languages(
  map: LanguageMap,
  pathname: string,
  lang: string,
): Record<string, string> {
  const path = decode(pathname);
  return map[path] ?? map[`/${lang}${path === "/" ? "" : path}`] ?? {};
}
