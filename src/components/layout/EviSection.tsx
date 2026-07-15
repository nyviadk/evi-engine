import { cn } from "@/src/lib/utils/cn";

export type EviSectionProps = React.ComponentProps<"section"> & {
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
};

export function EviSection({
  theme = "light",
  hero = false,
  collapsePadding = false,
  collapseGapY = false,
  fullTopPadding = false,
  className,
  children,
  ...props
}: EviSectionProps): React.ReactElement {
  // Hero hugger nav'en → HALV top-padding af en normal sektion (nav'en giver
  // allerede visuel adskillelse). Bunden er stor på hero for at løfte den.
  // fullTopPadding opter ud af hug'et (fx centered hero uden billede at balancere).
  const pb = hero ? "pb-20 md:pb-32" : "pb-16 md:pb-24";
  const pt = collapsePadding
    ? "pt-0"
    : hero && !fullTopPadding
      ? "pt-8 md:pt-12"
      : "pt-16 md:pt-24";

  // Standard gap-y er stor (12/16) så blokke visuelt adskilles som
  // selvstændige enheder. collapseGapY matcher gap-y til gap-x, hvilket
  // giver layouts som 3-kol blok-grid'en et sammenhængende "gitter"-look.
  const gapY = collapseGapY ? "gap-y-4 md:gap-y-8" : "gap-y-12 md:gap-y-16";

  return (
    <section
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
          "@container/section isolate mx-auto grid max-w-evi grid-cols-12 gap-x-4 overflow-x-clip px-4 md:gap-x-8",
          gapY,
        )}
      >
        {children}
      </div>
    </section>
  );
}
