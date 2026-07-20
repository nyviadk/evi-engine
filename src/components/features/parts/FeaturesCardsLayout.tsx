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
import { has_rich_text } from "@/src/lib/prismic/fields";
import {
  evi_card_title_class,
  evi_card_body_class,
} from "@/src/lib/utils/card-text";

export type FeaturesCardsLayoutProps = {
  slice: Content.FeaturesSliceCards;
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
  const cards = (slice.primary.cards ?? []).filter((c) =>
    has_rich_text(c.heading, c.body),
  );

  const cardColor = slice.primary.card_color;

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="features-cards"
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
              className={cn("mt-4", evi_card_title_class("xl"))}
            />
            <EviRichText
              field={card.body}
              linkResolver={linkResolver}
              className={cn("mt-2", evi_card_body_class())}
            />
          </EviCard>
        ))}
      </EviAutoGrid>
    </EviSection>
  );
}
