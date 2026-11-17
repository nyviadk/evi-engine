import { isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviAutoGrid } from "@/src/components/layout/EviAutoGrid";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviIconBadge } from "@/src/components/ui/EviIconBadge";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviSectionHeader } from "@/src/components/typography/EviSectionHeader";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { resolve_heading_align } from "@/src/lib/prismic/align";
import { has_rich_text } from "@/src/lib/prismic/fields";

export type FeaturesIconListLayoutProps = {
  slice: Content.FeaturesSliceIconList;
  index: number;
  context: EviPageSliceContext;
};

/**
 * Features-variation "icon-list": overskrift + intro, derefter en liste af korte
 * punkter (ikon-badge + tekst) i 1 → 2 → 3 → 4 kolonner efter containerbredden.
 * Ikonet står altid ved siden af teksten, også i smalle kolonner; badgen er en
 * blød primær-tone (surface), så listen ikke bliver tung. Domain-part (R3.3).
 */
export function FeaturesIconListLayout({
  slice,
  index,
  context,
}: FeaturesIconListLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  // Kun punkter med tekst — et ikon alene siger ingenting.
  const items = (p.items ?? []).filter((item) => isFilled.richText(item.text));

  if (!has_rich_text(p.heading, p.body) && items.length === 0) return null;

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="features-icon-list"
    >
      <EviSectionHeader
        title={p.heading}
        description={p.body}
        linkResolver={linkResolver}
        isHero={isHero}
        align={resolve_heading_align(p.heading_align)}
      />
      {items.length > 0 && (
        <EviAutoGrid as="ul" size="sm" gap="compact">
          {items.map((item, i) => (
            <EviStack key={i} as="li" direction="row" align="center" gap="md">
              <EviIconBadge name={item.icon} size="md" tone="surface" />
              <span className="min-w-0 font-semibold wrap-break-word">
                <EviRichText.Inline field={item.text} linkResolver={linkResolver} />
              </span>
            </EviStack>
          ))}
        </EviAutoGrid>
      )}
    </EviSection>
  );
}
