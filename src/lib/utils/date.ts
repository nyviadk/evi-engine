/** Et ISO-tidspunkt som "ÅÅÅÅ-MM-DD" i en tidszone, fx sitets (settings.timezone). */
export function local_date(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

/** "ÅÅÅÅ-MM-DD" i kort dansk form: 11/11-2026. */
export function short_date(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}/${month}-${year}`;
}
