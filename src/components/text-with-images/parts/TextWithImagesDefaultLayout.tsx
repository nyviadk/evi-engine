import { isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviImage } from "@/src/components/ui/EviImage";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { has_rich_text } from "@/src/lib/prismic/fields";

export type TextWithImagesDefaultLayoutProps = {
  slice: Content.TextWithImagesSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

/**
 * TextWithImages "default": simpel billede+tekst-sektion — overskrift + brødtekst
 * i den ene kolonne, et rammet billede i den anden (50-50 split). `image_side`
 * styrer billedets side på desktop, `mobile_order` rækkefølgen på mobil.
 * Domain-part (Tailwind tilladt, R3.3); rendres af dispatcheren.
 *
 * a11y: DOM leder ALTID med indholdet (overskrift først → bedst for skærmlæser);
 * billed-side + mobil-rækkefølge er PURT visuelle via EviSplit's CSS-`order`
 * (fokus/læse-rækkefølge uændret, sikkert da billed-blokken ikke har fokuserbare
 * børn).
 */
export function TextWithImagesDefaultLayout({
  slice,
  index,
  context,
}: TextWithImagesDefaultLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  if (!has_rich_text(p.heading, p.body) && !isFilled.image(p.image)) {
    return null;
  }

  const imageLeftOnDesktop = p.image_side !== "Højre";
  const imageTopOnMobile = p.mobile_order !== "Tekst øverst";
  // Billedvisning: "Rammet" (paspartout, hele motivet) vs "Kant-til-kant"
  // (cover — fylder rammen ud). 4:3-constraint → ingen af dem beskærer motivet.
  const framed = p.image_display !== "Kant-til-kant";

  const contentEl = (
    <EviHeadingGroup
      title={p.heading}
      description={p.body}
      linkResolver={linkResolver}
      isHero={isHero}
    />
  );
  const imageEl = (
    <EviImage
      field={p.image}
      aspectRatio="landscape"
      sizes="(min-width: 768px) 45vw, 92vw"
      priority={isHero}
      variant={framed ? "framed" : "plain"}
      imageClassName={framed ? undefined : "object-cover"}
    />
  );

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="text-with-images"
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
