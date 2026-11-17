import { isFilled, type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { EviMasonry } from "@/src/components/layout/EviMasonry";
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

export type TextWithImagesCollageLayoutProps = {
  slice: Content.TextWithImagesSliceCollage;
  index: number;
  context: EviPageSliceContext;
};

// Vekslende højder (stående/kvadrat) giver masonry-klyngen sit forskudte look —
// ens højder ville bare blive et fladt gitter. Rækkefølgen matcher model-
// constraints (Billede 1/4 = 3:4, Billede 2/3 = 1:1), så Page Builder-croppet
// passer med det renderede forhold.
const COLLAGE_RATIOS = ["3:4", "square", "square", "3:4"] as const;

/**
 * TextWithImages "collage": tekst-kolonne (overskrift + brødtekst + knap, lodret
 * centreret) ved siden af en forskudt masonry-klynge af 4 billeder. `image_side`
 * styrer billed-kolonnens side på desktop, `mobile_order` rækkefølgen på mobil.
 * Domain-part; rendres af dispatcheren.
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
  const images = [p.image_1, p.image_2, p.image_3, p.image_4].map(
    (field, i) => ({ field, ratio: COLLAGE_RATIOS[i] }),
  );
  const filledImages = images.filter((it) => isFilled.image(it.field));
  if (!has_rich_text(p.heading, p.body) && !has_cta && filledImages.length === 0) {
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
  // Masonry cap'er til 2 spalter; `cluster`-basis så en smal split-pane får 2
  // spalter (19rem-standarden ville falde til 1). Kun 1. billede er priority (LCP).
  // `direction:rtl` når klyngen er til venstre → spejler spalte-rækkefølgen, så
  // alternerende (zig-zag) collage-sektioner reflekterer hinanden frem for at
  // gentage samme klynge. Vender KUN multicol-kolonnerne (billeder = intet
  // tekst-flow); rent visuelt.
  const imageEl = (
    <EviMasonry
      maxColumns={2}
      basis="cluster"
      className={imageLeftOnDesktop ? "[direction:rtl]" : undefined}
    >
      {filledImages.map((it, i) => (
        <EviImage
          key={it.field.url}
          field={it.field}
          aspectRatio={it.ratio}
          variant="plain"
          imageClassName="object-cover"
          sizes="(min-width: 768px) 23vw, 46vw"
          className="shadow-evi"
          priority={isHero && i === 0}
        />
      ))}
    </EviMasonry>
  );

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
