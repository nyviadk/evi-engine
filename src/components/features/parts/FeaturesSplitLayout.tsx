import { asText, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviBox } from "@/src/components/ui/EviBox";
import { EviIconBadge } from "@/src/components/ui/EviIconBadge";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import {
  EviBackdropImage,
  BACKDROP_FROM_LABEL,
} from "@/src/components/ui/EviBackdropImage";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { evi_list_text_class } from "@/src/lib/utils/card-text";
import { cn } from "@/src/lib/utils/cn";

export type FeaturesSplitLayoutProps = {
  slice: Content.FeaturesSliceSplit;
  index: number;
  context: EviPageSliceContext;
};

/**
 * Features-variation "split": billede i venstre kolonne, overskrift + brødtekst
 * + en vertikal stak af feature-bokse (ikon-cirkel + overskrift + tekst) i højre.
 * `mobile_order` styrer om billede eller tekst kommer først på mobil. Domain-part
 * (Tailwind tilladt, R3.3).
 */
export function FeaturesSplitLayout({
  slice,
  index,
  context,
}: FeaturesSplitLayoutProps): React.ReactElement {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  // Kun bokse med tekst — tomme group-rækker skal ikke rendres.
  const boxes = (p.features ?? []).filter((f) =>
    has_rich_text(f.heading, f.body),
  );
  const backdrop = BACKDROP_FROM_LABEL[p.backdrop ?? "Ingen"] ?? "none";

  // a11y: DOM leder ALTID med indholdet (overskrift først → bedst for skærmlæser
  // + heading-navigation). Billed-siden (desktop) og mobil-rækkefølgen er PURT
  // visuelle og styres via CSS `order` på EviSplit — læse-/fokus-rækkefølgen
  // ændres aldrig. Sikkert her fordi billed-blokken ikke har fokuserbare børn.
  const imageLeftOnDesktop = p.image_side !== "Højre";
  const imageTopOnMobile = p.mobile_order !== "Tekst øverst";

  const imageEl = (
    <EviBackdropImage
      field={p.image}
      backdrop={backdrop}
      color={p.backdrop_color}
      priority={isHero}
    />
  );
  const contentEl = (
    <EviStack gap="lg">
      <EviHeadingGroup
        title={p.heading}
        description={p.body}
        linkResolver={linkResolver}
        isHero={isHero}
      />
      <EviStack gap="sm">
        {boxes.map((box) => (
          <EviBox
            key={asText(box.heading) || asText(box.body)}
            surface={p.feature_color}
            size="compact"
          >
            <EviStack direction="row" gap="md" align="start">
              <EviIconBadge name={box.icon} />
              {/* Boks-titel: skalér evi-prose h3 ned til kort-titel-størrelse.
                  opacity-80 dæmper brødteksten let (kun her, ikke i highlights). */}
              <div
                className={cn(
                  "evi-prose",
                  evi_list_text_class(),
                  "[&_p]:opacity-80",
                )}
              >
                <EviRichText.Raw
                  field={box.heading}
                  linkResolver={linkResolver}
                />
                <EviRichText.Raw field={box.body} linkResolver={linkResolver} />
              </div>
            </EviStack>
          </EviBox>
        ))}
      </EviStack>
    </EviStack>
  );

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="features-split"
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
