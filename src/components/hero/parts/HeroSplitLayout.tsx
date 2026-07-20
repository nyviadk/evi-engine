import { isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviTag } from "@/src/components/ui/EviTag";
import {
  EviBackdropImage,
  BACKDROP_FROM_LABEL,
} from "@/src/components/ui/EviBackdropImage";
import { HeroCtaGroup } from "@/src/components/hero/parts/HeroCtaGroup";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { is_link_filled } from "@/src/lib/prismic/links";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

export type HeroSplitLayoutProps = {
  slice: Content.HeroSliceSplit;
  index: number;
  context: EviPageSliceContext;
};

/**
 * Hero-variation "split" — 2-kolonne hero: venstre tag + overskrift + brødtekst
 * + CTA, højre kvadratisk billede med blød roteret backdrop. Domain-part
 * (Tailwind tilladt jf. R3.3); rendres af Hero-dispatcheren via dynamic import.
 */
export function HeroSplitLayout({
  slice,
  index,
  context,
}: HeroSplitLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  const has_cta = is_link_filled(p.cta_link);
  const has_cta_2 = is_link_filled(p.cta_link_secondary);
  if (
    !has_rich_text(p.heading, p.body) &&
    !has_cta &&
    !has_cta_2 &&
    !isFilled.image(p.image)
  ) {
    return null;
  }
  const backdrop = BACKDROP_FROM_LABEL[p.backdrop ?? "Roteret"] ?? "rotated";

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="hero-split"
    >
      <EviSplit preset="50-50" align="center">
        <EviStack gap="lg" align="start">
          <EviTag
            icon={p.tag_icon}
            text={p.tag_text}
            linkResolver={linkResolver}
          />
          <EviHeadingGroup
            title={p.heading}
            description={p.body}
            linkResolver={linkResolver}
            isHero={isHero}
          />
          <HeroCtaGroup
            primary={p.cta_link}
            secondary={p.cta_link_secondary}
            linkResolver={linkResolver}
          />
        </EviStack>

        <EviBackdropImage
          field={p.image}
          mobileField={p.image_mobile}
          backdrop={backdrop}
          color={p.backdrop_color}
          priority={isHero}
        />
      </EviSplit>
    </EviSection>
  );
}
