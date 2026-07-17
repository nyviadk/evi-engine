import { cn } from "@/src/lib/utils/cn";

export type EviSectionProps = React.ComponentProps<"section"> & {
  /** Semantisk element. Sidens footer skal fx være et `<footer>`. @default "section" */
  as?: "section" | "footer";
  /** Tema-klasse, fx "light", "dark", "primary-soft". @default "light" */
  theme?: string;
  /** Større top/bund padding på hero-sektioner. @default false */
  hero?: boolean;
  /** Drop top-padding når sektionen visuelt smelter sammen med den ovenfor. */
  collapsePadding?: boolean;
  /** Matcher vertikal gap til horisontal gap — bruges af "gitter"-layouts. */
  collapseGapY?: boolean;
  /** Tving normal (fuld) top-padding selvom hero — fx centered hero der ser
   *  for tæt på nav'en ud med den reducerede hero-hug. @default false */
  fullTopPadding?: boolean;
  /** Mindre bund-padding — til page-end-bånd (footer), hvor bunden er sidekant-
   *  margin, ikke adskillelse til en næste sektion. @default false */
  compactBottom?: boolean;
};

export function EviSection({
  as: Tag = "section",
  theme = "light",
  hero = false,
  collapsePadding = false,
  collapseGapY = false,
  fullTopPadding = false,
  compactBottom = false,
  className,
  children,
  ...props
}: EviSectionProps): React.ReactElement {
  // Normale sektioner er SYMMETRISKE (top = bund) → balancerede bånd + jævn
  // rytme mellem sektioner (asymmetri ser skæv ud). Hero adskiller sig KUN ved
  // toppen: den hugger nav'en (lille top-padding), da nav'en allerede giver
  // visuel adskillelse. fullTopPadding opter ud af hug'et (fx centered hero uden
  // billede at balancere). compactBottom: markant mindre bund til page-end-bånd
  // (footer) hvor bunden bare er sidekant-margin, ikke adskillelse til en næste
  // sektion — bevidst asymmetrisk der (ca. halvdelen af den normale bund).
  const pb = compactBottom ? "pb-10 md:pb-14" : "pb-24 md:pb-32";
  const pt = collapsePadding
    ? "pt-0"
    : hero && !fullTopPadding
      ? "pt-8 md:pt-12"
      : "pt-24 md:pt-32";

  // Standard gap-y er stor (12/16) så blokke visuelt adskilles som
  // selvstændige enheder. collapseGapY matcher gap-y til gap-x, hvilket
  // giver layouts som 3-kol blok-grid'en et sammenhængende "gitter"-look.
  const gapY = collapseGapY ? "gap-y-4 md:gap-y-16" : "gap-y-12 md:gap-y-16";

  return (
    <Tag
      data-slot="evi-section"
      data-theme={theme}
      data-hero={hero || undefined}
      className={cn(`theme-${theme}`, pt, pb, className)}
      {...props}
    >
      <div
        className={cn(
          // overflow-x-clip: roterede/forskudte dekorationer (fx EviBackdropImage)
          // kan aldrig lave vandret side-scroll. Kun x — y forbliver visible, og
          // børn med egen overflow-x-auto (EviPhoneCarousel) scroller uændret.
          "@container/section isolate mx-auto grid max-w-evi grid-cols-12 gap-x-4 overflow-x-clip px-4 md:gap-x-16",
          gapY,
        )}
      >
        {children}
      </div>
    </Tag>
  );
}
