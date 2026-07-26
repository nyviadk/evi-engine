import { asText, isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviBox } from "@/src/components/ui/EviBox";
import { EviButton } from "@/src/components/ui/EviButton";
import { EviImage } from "@/src/components/ui/EviImage";
import { EviIconList } from "@/src/components/ui/EviIconList";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { resolve_heading_align } from "@/src/lib/prismic/align";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { evi_card_title_class } from "@/src/lib/utils/card-text";

export type MapsDefaultLayoutProps = {
  slice: Content.MapsSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

/**
 * Maps "default": intro + to kolonner — et statisk kort-billede + en info-boks
 * (adresse, info-punkter, og "Åbn i …"-knapper). Kort-links bygges DYNAMISK af
 * adressen (bruger-initieret klik → samtykke-frit; intet tredjeparts-kort loades
 * på siden). Statisk billede = ingen cookies/IP-overførsel. Domain-part (R3.3).
 */
export function MapsDefaultLayout({
  slice,
  index,
  context,
}: MapsDefaultLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  const hasImage = isFilled.image(p.map_image);
  const info = p.info_items ?? [];
  const hasBox =
    has_rich_text(p.box_heading, p.address) ||
    info.some((it) => isFilled.richText(it.text));
  if (!has_rich_text(p.heading, p.body) && !hasImage && !hasBox) return null;

  // Adresse → maps-links (bruger-initieret navigation, ingen tredjeparts-load).
  const addressStr = asText(p.address)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
  const q = encodeURIComponent(addressStr);
  const googleUrl = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const appleUrl = `https://maps.apple.com/?q=${q}`;
  const showButtons =
    addressStr.length > 0 &&
    (isFilled.keyText(p.google_maps_label) ||
      isFilled.keyText(p.apple_maps_label));

  const boxEl = (
    <EviBox surface="Neutral">
      {/* h-full: stakken fylder den strakte boks → mt-auto på knapperne kan
          skubbe dem til bunden. */}
      <EviStack gap="md" className="h-full">
        {isFilled.richText(p.box_heading) ? (
          <EviRichText
            field={p.box_heading}
            linkResolver={linkResolver}
            className={evi_card_title_class("lg")}
          />
        ) : null}
        {isFilled.richText(p.address) ? (
          <EviRichText
            field={p.address}
            linkResolver={linkResolver}
            className="[&_p]:m-0"
          />
        ) : null}
        <EviIconList items={info} linkResolver={linkResolver} />
        {showButtons ? (
          // mt-auto: skub knapperne til bunden af den strakte boks.
          <EviStack direction="row" wrap gap="sm" className="mt-auto pt-2">
            {isFilled.keyText(p.google_maps_label) ? (
              <EviButton asChild variant="primary" appearance="solid" size="md">
                <a href={googleUrl} target="_blank" rel="noopener noreferrer">
                  {p.google_maps_label}
                </a>
              </EviButton>
            ) : null}
            {isFilled.keyText(p.apple_maps_label) ? (
              <EviButton
                asChild
                variant="primary"
                appearance="outline"
                size="md"
              >
                <a href={appleUrl} target="_blank" rel="noopener noreferrer">
                  {p.apple_maps_label}
                </a>
              </EviButton>
            ) : null}
          </EviStack>
        ) : null}
      </EviStack>
    </EviBox>
  );

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="maps"
    >
      {has_rich_text(p.heading, p.body) ? (
        <EviHeadingGroup
          title={p.heading}
          description={p.body}
          linkResolver={linkResolver}
          isHero={isHero}
          align={resolve_heading_align(p.heading_align)}
        />
      ) : null}

      {hasImage || hasBox ? (
        <EviSplit preset="50-50" align="stretch">
          <EviImage
            field={p.map_image}
            aspectRatio="landscape"
            variant="plain"
            sizes="(min-width: 768px) 45vw, 92vw"
            priority={isHero}
          />
          {boxEl}
        </EviSplit>
      ) : null}
    </EviSection>
  );
}
