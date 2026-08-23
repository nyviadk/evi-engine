import { isFilled, type Content } from "@prismicio/client";

import {
  EviCoverSection,
  OVERLAY_FROM_LABEL,
} from "@/src/components/layout/EviCoverSection";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviImage } from "@/src/components/ui/EviImage";
import { HeroCtaGroup } from "@/src/components/hero/parts/HeroCtaGroup";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { is_link_filled } from "@/src/lib/prismic/links";
import { resolve_content_align } from "@/src/lib/prismic/align";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

export type HeroCoverLayoutProps = {
  slice: Content.HeroSliceCover;
  index: number;
  context: EviPageSliceContext;
};

/**
 * Hero-variation "cover" — full-bleed billede (edge-to-edge) med overskrift,
 * brødtekst og op til to knapper ovenpå. `content_align` (Venstre/Centreret/Højre)
 * styrer indholdets justering, `overlay_color` scrim + tekst/knap-farver. Højde +
 * full-bleed-mekanik ligger i EviCoverSection. Domain-part; rendres af Hero-
 * dispatcheren via dynamic import.
 */
export function HeroCoverLayout({
  slice,
  index,
  context,
}: HeroCoverLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { isHero } = resolve_slice_context(context, index);
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

  const align = resolve_content_align(p.content_align);
  const overlay = OVERLAY_FROM_LABEL[p.overlay_color ?? "Mørk"] ?? "dark";

  const imageEl = (
    <EviImage
      field={p.image}
      mobileField={p.image_mobile}
      aspectRatio="auto"
      variant="plain"
      rounded={false}
      imageClassName="object-cover"
      sizes="100vw"
      className="size-full"
      priority={isHero}
    />
  );

  return (
    <EviCoverSection image={imageEl} overlay={overlay} data-slot="hero-cover">
      <EviStack gap="lg">
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
    </EviCoverSection>
  );
}
