import { asText, isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviAutoGrid } from "@/src/components/layout/EviAutoGrid";
import { EviCard } from "@/src/components/ui/EviCard";
import { EviIcon } from "@/src/components/ui/EviIcon";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { cn } from "@/src/lib/utils/cn";

// Prismic-label (card_color) → kort-flade + ikon-cirkel. Cirklen skifter til
// neutral på tintede kort, så den ikke smelter sammen med fladen.
const CARD_SURFACE: Record<string, { card: string; circle: string }> = {
  Neutral: { card: "theme-surface-neutral", circle: "theme-surface-primary" },
  Primær: { card: "theme-surface-primary", circle: "theme-surface-neutral" },
  Sekundær: {
    card: "theme-surface-secondary",
    circle: "theme-surface-neutral",
  },
};

export type FeaturesCardsLayoutProps = {
  slice: Content.SectionFeaturesSliceCards;
  index: number;
  context: EviPageSliceContext;
};

/**
 * Features-variation "cards": centreret overskrift + intro, derefter et
 * repeatable kort-grid (ikon, overskrift, tekst). Grid skalerer 1 → 2 → 3 og
 * wrapper til nye rækker (`size="trio"` — cappet ved 3, rammer 3 ved laptop-
 * bredde). Domain-part (Tailwind tilladt, R3.3).
 */
export function FeaturesCardsLayout({
  slice,
  index,
  context,
}: FeaturesCardsLayoutProps): React.ReactElement {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );

  // Kun kort med tekst — tomme group-rækker skal ikke rendres.
  const cards = (slice.primary.cards ?? []).filter(
    (c) => isFilled.richText(c.heading) || isFilled.richText(c.body),
  );

  const surface =
    CARD_SURFACE[slice.primary.card_color ?? "Neutral"] ?? CARD_SURFACE.Neutral;

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="section-features-cards"
    >
      <EviHeadingGroup
        title={slice.primary.heading}
        description={slice.primary.body}
        linkResolver={linkResolver}
        isHero={isHero}
        align="center"
      />
      <EviAutoGrid size="trio">
        {cards.map((card) => (
          <EviCard
            key={asText(card.heading) || asText(card.body)}
            rows={3}
            className={cn(surface.card, "rounded-evi p-6 shadow-evi md:p-8")}
          >
            {isFilled.keyText(card.icon) ? (
              <span
                className={cn(surface.circle, "flex w-fit rounded-full p-3")}
              >
                <EviIcon name={card.icon} className="size-6 text-evi-primary" />
              </span>
            ) : (
              <div />
            )}
            <EviRichText
              field={card.heading}
              linkResolver={linkResolver}
              className="mt-4 [&_h3]:m-0 [&_h3]:text-xl [&_h3]:leading-snug [&_h3]:font-semibold"
            />
            <EviRichText
              field={card.body}
              linkResolver={linkResolver}
              className="mt-2 [&_p]:m-0"
            />
          </EviCard>
        ))}
      </EviAutoGrid>
    </EviSection>
  );
}
