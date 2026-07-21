/** Sti uden query/hash og uden efterstillet skråstreg (roden forbliver "/"). */
export function normalize_path(path: string): string {
  const trimmed = (path.split(/[?#]/)[0] ?? path).replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/** Fjern ledende `/<lang>`-segment, så en præfikset sti og et præfiks-løst link
 *  lander i samme sti-rum. */
export function strip_locale(path: string, lang?: string): string {
  if (!lang) return path;
  if (path === `/${lang}`) return "/";
  if (path.startsWith(`/${lang}/`)) return path.slice(lang.length + 1);
  return path;
}

/**
 * Er linket den aktuelle side? Eksakt match, ELLER underside-sektion
 * (`/ydelser` er aktiv på `/ydelser/angst`). Home ("/") matcher kun eksakt.
 */
export function is_active_path(
  href: string,
  current: string,
  lang?: string,
): boolean {
  const h = strip_locale(normalize_path(href), lang);
  const c = strip_locale(normalize_path(current), lang);
  return h === c || (h !== "/" && c.startsWith(`${h}/`));
}
