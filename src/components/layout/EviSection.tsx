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
  // Normale sektioner er symmetriske (top = bund). Hero hugger nav'en (lille
  // top), da nav'en selv adskiller; compactBottom giver bevidst mindre bund til
  // page-end-bånd (footer).
  const pb = compactBottom ? "pb-10 md:pb-14" : "pb-24 md:pb-32";
  const pt = collapsePadding
    ? "pt-0"
    : hero && !fullTopPadding
      ? "pt-8 md:pt-12"
      : "pt-24 md:pt-32";

  // collapseGapY matcher gap-y til gap-x → sammenhængende "gitter"-look (fx 3-kol grid).
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
          // overflow-x-clip: dekorationer (fx EviBackdropImage) kan ikke lave
          // vandret side-scroll. Kun x — y visible, så børns overflow-x-auto virker.
          "@container/section isolate mx-auto grid max-w-evi grid-cols-12 gap-x-4 overflow-x-clip px-4 md:gap-x-16",
          gapY,
        )}
      >
        {children}
      </div>
    </Tag>
  );
}
