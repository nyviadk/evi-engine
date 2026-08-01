import { isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviAutoGrid } from "@/src/components/layout/EviAutoGrid";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviFigure } from "@/src/components/ui/EviFigure";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { resolve_heading_align } from "@/src/lib/prismic/align";
import { has_rich_text } from "@/src/lib/prismic/fields";

export type GalleryDefaultLayoutProps = {
  slice: Content.GallerySliceDefault;
  index: number;
  context: EviPageSliceContext;
};

/**
 * Gallery "default": intro + et fuld-bredde feature-billede (16:9) med billedtekst,
 * derefter et 3-kolonne-grid af billeder (4:3) med valgfri billedtekst pr. tile.
 * Alle billeder er `plain` (kant-til-kant foto) og cropper i editoren til deres
 * constraint (WYSIWYG). Domain-part (Tailwind tilladt, R3.3).
 */
export function GalleryDefaultLayout({
  slice,
  index,
  context,
}: GalleryDefaultLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  const items = (p.items ?? []).filter((it) => isFilled.image(it.image));
  const hasFeature = isFilled.image(p.feature_image);
  if (!has_rich_text(p.heading, p.body) && !hasFeature && items.length === 0) {
    return null;
  }

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="gallery"
    >
      {has_rich_text(p.heading, p.body) && (
        <EviHeadingGroup
          title={p.heading}
          description={p.body}
          linkResolver={linkResolver}
          isHero={isHero}
          align={resolve_heading_align(p.heading_align)}
        />
      )}

      {hasFeature && (
        <EviRow>
          <EviFigure
            field={p.feature_image}
            caption={p.feature_caption}
            linkResolver={linkResolver}
            aspectRatio="video"
            variant="plain"
            imageClassName="object-cover"
            sizes="(min-width: 1152px) 1152px, 92vw"
            priority={isHero}
          />
        </EviRow>
      )}

      {items.length > 0 && (
        <EviAutoGrid size="trio">
          {items.map((item, i) => (
            <EviFigure
              key={i}
              field={item.image}
              caption={item.caption}
              linkResolver={linkResolver}
              aspectRatio="landscape"
              variant="plain"
              imageClassName="object-cover"
              sizes="(min-width: 768px) 33vw, 92vw"
            />
          ))}
        </EviAutoGrid>
      )}
    </EviSection>
  );
}
