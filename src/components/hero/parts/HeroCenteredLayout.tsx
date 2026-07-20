import { type Content } from "@prismicio/client";

import { EviRow } from "@/src/components/layout/EviRow";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { HeroCtaGroup } from "@/src/components/hero/parts/HeroCtaGroup";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { is_link_filled } from "@/src/lib/prismic/links";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

export type HeroCenteredLayoutProps = {
  slice: Content.HeroSliceCentered;
  index: number;
  context: EviPageSliceContext;
};

/**
 * Hero-variation "centered" — centreret tekst-hero. Domain-part (Tailwind
 * tilladt jf. R3.3); rendres af Hero-dispatcheren via dynamic import.
 */
export function HeroCenteredLayout({
  slice,
  index,
  context,
}: HeroCenteredLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const p = slice.primary;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );

  const has_cta = is_link_filled(p.cta_link);
  const has_cta_2 = is_link_filled(p.cta_link_secondary);
  if (!has_rich_text(p.heading, p.body) && !has_cta && !has_cta_2) return null;

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      fullTopPadding
      data-slot="hero-centered"
    >
      <EviRow>
        <EviStack gap="lg" align="center">
          <EviHeadingGroup
            title={p.heading}
            description={p.body}
            linkResolver={linkResolver}
            isHero={isHero}
            align="center"
          />
          <HeroCtaGroup
            primary={p.cta_link}
            secondary={p.cta_link_secondary}
            linkResolver={linkResolver}
            align="center"
          />
        </EviStack>
      </EviRow>
    </EviSection>
  );
}
