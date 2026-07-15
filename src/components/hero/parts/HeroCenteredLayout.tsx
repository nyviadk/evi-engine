import { isFilled, type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { EviButton } from "@/src/components/ui/EviButton";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
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
}: HeroCenteredLayoutProps): React.ReactElement {
  const { linkResolver } = context;
  const { heading, body, cta_link } = slice.primary;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );

  const has_cta = isFilled.link(cta_link) && isFilled.keyText(cta_link.text);

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
            title={heading}
            description={body}
            linkResolver={linkResolver}
            isHero={isHero}
            className="text-center"
          />
          {has_cta && (
            <EviButton asChild variant="primary" appearance="solid" size="lg">
              <PrismicNextLink field={cta_link} linkResolver={linkResolver} />
            </EviButton>
          )}
        </EviStack>
      </EviRow>
    </EviSection>
  );
}
