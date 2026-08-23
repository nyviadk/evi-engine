/**
 * Prismic "Overskrift-justering"-select → Evi `align` ("start" | "center").
 * Ét sted at oversætte labelen (fragilt ved label-skift).
 */
export function resolve_heading_align(
  value: string | null | undefined,
): "start" | "center" {
  return value === "Venstre" ? "start" : "center";
}

/**
 * Prismic "Indholds-justering"-select (Venstre/Centreret/Højre) → Evi `align`
 * ("start" | "center" | "end"). Til layouts med tre-vejs justering (fx cover-hero).
 */
export function resolve_content_align(
  value: string | null | undefined,
): "start" | "center" | "end" {
  return value === "Centreret" ? "center" : value === "Højre" ? "end" : "start";
}
