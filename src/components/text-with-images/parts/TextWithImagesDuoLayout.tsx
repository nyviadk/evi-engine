import { isFilled, type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviButton } from "@/src/components/ui/EviButton";
import { EviImage } from "@/src/components/ui/EviImage";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { is_link_filled } from "@/src/lib/prismic/links";

export type TextWithImagesDuoLayoutProps = {
  slice: Content.TextWithImagesSliceDuo;
  index: number;
  context: EviPageSliceContext;
};

/**
 * TextWithImages "duo": tekst-kolonne (overskrift + brødtekst + knap) ved siden af
 * to billeder i forskellig højde med SAMME bundlinje (det ene stående, det andet
 * lavere). `image_side` styrer billed-kolonnens side på desktop (default: højre),
 * `mobile_order` rækkefølgen på mobil. Domain-part (Tailwind tilladt, R3.3).
 *
 * a11y: DOM leder ALTID med indholdet (tekst først); billed-side + mobil-
 * rækkefølge er PURT visuelle via EviSplit's CSS-`order` (billederne har ingen
 * fokuserbare børn).
 */
export function TextWithImagesDuoLayout({
  slice,
  index,
  context,
}: TextWithImagesDuoLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  const has_cta = is_link_filled(p.cta_link);
  const has_image = isFilled.image(p.image_1) || isFilled.image(p.image_2);
  if (!has_rich_text(p.heading, p.body) && !has_cta && !has_image) {
    return null;
  }

  const imageLeftOnDesktop = p.image_side === "Venstre";
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
  // To lige-brede billeder side om side (flex-1) i forskellig højde med SAMME
  // bundlinje (align="end"): venstre er lavere (kvadrat, Billede 2), højre er det
  // høje (3:4, Billede 1). EviStack på begge akser → kolonne-gap == række-gap.
  // Kun det høje billede er priority (LCP).
  const imageEl = (
    <EviStack rowFrom="md" gap="lg" align="end">
      <EviImage
        field={p.image_2}
        aspectRatio="square"
        variant="plain"
        imageClassName="object-cover"
        sizes="(min-width: 768px) 23vw, 46vw"
        className="shadow-evi flex-1"
      />
      <EviImage
        field={p.image_1}
        aspectRatio="3:4"
        variant="plain"
        imageClassName="object-cover"
        sizes="(min-width: 768px) 23vw, 46vw"
        className="shadow-evi flex-1"
        priority={isHero}
      />
    </EviStack>
  );

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="text-with-images-duo"
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
