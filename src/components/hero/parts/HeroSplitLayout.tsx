import { isFilled, type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviButton } from "@/src/components/ui/EviButton";
import { EviTag } from "@/src/components/ui/EviTag";
import {
  EviBackdropImage,
  BACKDROP_FROM_LABEL,
} from "@/src/components/ui/EviBackdropImage";
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
}: HeroSplitLayoutProps): React.ReactElement {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  const has_cta = isFilled.link(p.cta_link) && isFilled.keyText(p.cta_link.text);
  const has_cta_2 =
    isFilled.link(p.cta_link_secondary) &&
    isFilled.keyText(p.cta_link_secondary.text);
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
          {(has_cta || has_cta_2) && (
            <EviStack direction="row" wrap gap="sm">
              {has_cta && (
                <EviButton
                  asChild
                  variant="primary"
                  appearance="solid"
                  size="lg"
                >
                  <PrismicNextLink
                    field={p.cta_link}
                    linkResolver={linkResolver}
                  />
                </EviButton>
              )}
              {has_cta_2 && (
                <EviButton
                  asChild
                  variant="primary"
                  appearance="outline"
                  size="lg"
                >
                  <PrismicNextLink
                    field={p.cta_link_secondary}
                    linkResolver={linkResolver}
                  />
                </EviButton>
              )}
            </EviStack>
          )}
        </EviStack>

        <EviBackdropImage
          field={p.image}
          mobileField={p.image_mobile}
          backdrop={backdrop}
          priority={isHero}
        />
      </EviSplit>
    </EviSection>
  );
}
