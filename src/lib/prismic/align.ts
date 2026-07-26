/**
 * Prismic "Overskrift-justering"-select ("Venstre" | "Centreret") → EviHeadingGroup/
 * EviSectionHeader `align` ("start" | "center"). Ét sted at oversætte labelen, så
 * de 8 intro-slices ikke gentager streng-sammenligningen (fragilt ved label-skift).
 */
export function resolve_heading_align(
  value: string | null | undefined,
): "start" | "center" {
  return value === "Venstre" ? "start" : "center";
}
