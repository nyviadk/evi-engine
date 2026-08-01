/**
 * Statisk papir-korn-overlay over hele viewporten (fixed, pointer-events-none,
 * z-40 → under nav-dropdown/drawer/dialog, så de forbliver skarpe). Fast 64px
 * PNG-tile — IKKE procedural SVG/filter-noise, som forsvinder på hi-DPI (hvert
 * korn falder under 1 fysisk pixel). Rent dekorativt → aria-hidden. Styles i
 * globals.css (`.paper-grain`); slås til/fra via Settings.
 */
export function EviPaperGrain(): React.ReactElement {
  return <div className="paper-grain" aria-hidden="true" />;
}
