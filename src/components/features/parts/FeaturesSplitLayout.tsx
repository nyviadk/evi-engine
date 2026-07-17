import { asText, isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviIcon } from "@/src/components/ui/EviIcon";
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
import { cn } from "@/src/lib/utils/cn";

// feature_color → boks-flade (samme mønster som cards-variationen).
const BOX_SURFACE: Record<string, string> = {
  Neutral: "theme-surface-neutral",
  Primær: "theme-surface-primary",
  Sekundær: "theme-surface-secondary",
};

export type FeaturesSplitLayoutProps = {
  slice: Content.SectionFeaturesSliceSplit;
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
  const boxes = (p.features ?? []).filter(
    (f) => isFilled.richText(f.heading) || isFilled.richText(f.body),
  );
  const boxSurface = BOX_SURFACE[p.feature_color ?? "Neutral"] ?? BOX_SURFACE.Neutral;
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
          <div
            key={asText(box.heading) || asText(box.body)}
            className={cn(boxSurface, "rounded-evi p-4 md:p-6")}
          >
            <EviStack direction="row" gap="md" align="start">
              {isFilled.keyText(box.icon) && (
                <span className="inline-flex shrink-0 rounded-full bg-evi-secondary p-2">
                  <EviIcon
                    name={box.icon}
                    className="size-5 text-evi-text-on-secondary"
                  />
                </span>
              )}
              {/* Boks-titel: skalér evi-prose h3 ned til kort-titel-størrelse. */}
              <div className="evi-prose [&_h3]:m-0 [&_h3]:text-base [&_h3]:font-semibold [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-sm [&_p]:opacity-80">
                <EviRichText.Raw
                  field={box.heading}
                  linkResolver={linkResolver}
                />
                <EviRichText.Raw field={box.body} linkResolver={linkResolver} />
              </div>
            </EviStack>
          </div>
        ))}
      </EviStack>
    </EviStack>
  );

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="section-features-split"
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
