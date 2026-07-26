/**
 * Prismic "Overskrift-justering"-select → Evi `align` ("start" | "center").
 * Ét sted at oversætte labelen (fragilt ved label-skift).
 */
export function resolve_heading_align(
  value: string | null | undefined,
): "start" | "center" {
  return value === "Venstre" ? "start" : "center";
}
