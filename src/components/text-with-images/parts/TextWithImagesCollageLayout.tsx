import { isFilled, type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviButton } from "@/src/components/ui/EviButton";
import { StaggeredImages } from "@/src/components/text-with-images/parts/StaggeredImages";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { is_link_filled } from "@/src/lib/prismic/links";

export type TextWithImagesCollageLayoutProps = {
  slice: Content.TextWithImagesSliceCollage;
  index: number;
  context: EviPageSliceContext;
};

/**
 * TextWithImages "collage": tekst-kolonne (overskrift + brødtekst + knap, lodret
 * centreret) ved siden af en forskudt klynge af 4 billeder. `image_side` styrer
 * billed-kolonnens side på desktop, `mobile_order` rækkefølgen på mobil.
 * Domain-part (Tailwind tilladt, R3.3); rendres af dispatcheren.
 *
 * a11y: DOM leder ALTID med indholdet (tekst først → bedst for skærmlæser);
 * billed-side + mobil-rækkefølge er PURT visuelle via EviSplit's CSS-`order`
 * (sikkert da billed-klyngen ikke har fokuserbare børn).
 */
export function TextWithImagesCollageLayout({
  slice,
  index,
  context,
}: TextWithImagesCollageLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  const has_cta = is_link_filled(p.cta_link);
  const images = [p.image_1, p.image_2, p.image_3, p.image_4];
  const has_image = images.some((img) => isFilled.image(img));
  if (!has_rich_text(p.heading, p.body) && !has_cta && !has_image) {
    return null;
  }

  const imageLeftOnDesktop = p.image_side !== "Højre";
  const imageTopOnMobile = p.mobile_order !== "Tekst øverst";

  const contentEl = (
    <EviStack gap="lg" align="start">
      <EviHeadingGroup
        title={p.heading}
        description={p.body}
        linkResolver={linkResolver}
        isHero={isHero}
      />
      {has_cta && (
        <EviButton asChild variant="primary" appearance="solid" size="lg">
          <PrismicNextLink field={p.cta_link} linkResolver={linkResolver} />
        </EviButton>
      )}
    </EviStack>
  );
  const imageEl = <StaggeredImages images={images} priority={isHero} />;

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="text-with-images-collage"
    >
      <EviSplit
        preset="50-50"
        align="center"
        reverse={imageLeftOnDesktop}
        mobileReverse={imageTopOnMobile}
      >
        {contentEl}
        {imageEl}
      </EviSplit>
    </EviSection>
  );
}
