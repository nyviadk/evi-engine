import { isFilled, type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
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

/**
 * HeroSimple — centreret tekst-hero. Ren Evi-composition.
 *
 * Cross-slice context (isHero + collapsePadding) læses hvis parent har
 * kaldt compute_slice_contexts (production-page). Fallback til self-derived
 * defaults hvis context mangler (preview / slice-simulator standalone).
 */
export default function HeroSimple({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.HeroSimpleSlice,
  EviPageSliceContext
>): React.ReactElement {
  const { linkResolver } = context;
  const { heading, body, cta_link } = slice.primary;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );

  const has_cta =
    isFilled.link(cta_link) && isFilled.keyText(cta_link.text);

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="hero-simple"
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
