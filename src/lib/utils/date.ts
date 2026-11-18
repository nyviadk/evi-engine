/** Et ISO-tidspunkt som "ÅÅÅÅ-MM-DD" i en tidszone, fx sitets (settings.timezone). */
export function local_date(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

/**
 * "ÅÅÅÅ-MM-DD" skrevet ud på sidens sprog: "17. november 2026" / "17 November 2026".
 * UTC, så en ren dato aldrig glider en dag i serverens tidszone.
 */
export function long_date(date: string, lang: string): string {
  // Prismics "en-eu" kender Intl ikke → amerikansk form; "150" er CLDR's Europa.
  return new Intl.DateTimeFormat(lang.replace(/-eu$/i, "-150"), {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

/** "ÅÅÅÅ-MM-DD" i kort dansk form: 11/11-2026. */
export function short_date(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}/${month}-${year}`;
}
