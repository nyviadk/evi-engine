import { asText, isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviAutoGrid } from "@/src/components/layout/EviAutoGrid";
import { EviCard } from "@/src/components/ui/EviCard";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { cn } from "@/src/lib/utils/cn";
import { evi_box_class } from "@/src/components/ui/EviBox";
import { EviIconBadge } from "@/src/components/ui/EviIconBadge";
import { resolve_surface } from "@/src/lib/utils/surface";

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

  const cardColor = slice.primary.card_color;

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
            className={cn(resolve_surface(cardColor), evi_box_class())}
          >
            {isFilled.keyText(card.icon) ? (
              <EviIconBadge
                name={card.icon}
                size="md"
                tone="surface"
                on={cardColor}
              />
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
