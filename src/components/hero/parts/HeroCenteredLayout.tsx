import { type Content } from "@prismicio/client";

import { EviRow } from "@/src/components/layout/EviRow";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { HeroCtaGroup } from "@/src/components/hero/parts/HeroCtaGroup";
import { resolve_heading_align } from "@/src/lib/prismic/align";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { has_link } from "@/src/lib/prismic/links";
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
 * Hero-variation "centered" — tekst-hero i én kolonne, centreret eller
 * venstrestillet efter `heading_align` (default centreret). Domain-part (Tailwind
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

  const align = resolve_heading_align(p.heading_align);

  if (
    !has_rich_text(p.heading, p.body) &&
    !has_link(p.cta_link, p.cta_link_secondary)
  ) {
    return null;
  }

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      fullTopPadding
      data-slot="hero-centered"
    >
      <EviRow>
        <EviStack gap="lg" align={align}>
          <EviHeadingGroup
            title={p.heading}
            description={p.body}
            linkResolver={linkResolver}
            isHero={isHero}
            align={align}
          />
          <HeroCtaGroup
            primary={p.cta_link}
            secondary={p.cta_link_secondary}
            linkResolver={linkResolver}
            align={align}
          />
        </EviStack>
      </EviRow>
    </EviSection>
  );
}
