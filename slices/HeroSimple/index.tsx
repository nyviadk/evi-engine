import type { Content } from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicNextLink } from "@prismicio/next";

import { EviButton } from "@/src/components/ui/EviButton";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { resolve_section_theme } from "@/src/lib/prismic/section-theme";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * HeroSimple — centreret tekst-hero. Ren Evi-composition.
 * Selvstændig: læser sine egne felter, ingen cross-slice context-afhængighed.
 * Heading er låst til heading1 i modellen og rendres altid som h1.
 */
export default function HeroSimple({
  slice,
  context,
}: SliceComponentProps<
  Content.HeroSimpleSlice,
  EviPageSliceContext
>): React.ReactElement {
  const { linkResolver } = context;
  const { heading, body, cta_link, background_theme } = slice.primary;

  const theme = resolve_section_theme(background_theme);
  const cta_label =
    isFilled.link(cta_link) && isFilled.keyText(cta_link.text)
      ? cta_link.text
      : null;

  return (
    <EviSection theme={theme} hero data-slot="hero-simple">
      <EviRow>
        <EviStack gap="lg" align="center">
          <EviHeadingGroup
            title={heading}
            description={body}
            linkResolver={linkResolver}
            className="text-center"
          />
          {isFilled.link(cta_link) && cta_label && (
            <EviButton asChild variant="primary" appearance="solid" size="lg">
              <PrismicNextLink field={cta_link} linkResolver={linkResolver}>
                {cta_label}
              </PrismicNextLink>
            </EviButton>
          )}
        </EviStack>
      </EviRow>
    </EviSection>
  );
}
