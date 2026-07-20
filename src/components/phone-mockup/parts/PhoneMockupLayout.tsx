import { isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviPhoneCarousel } from "@/src/components/ui/EviPhoneCarousel";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

export type PhoneMockupLayoutProps = {
  slice: Content.PhoneMockupSlice;
  index: number;
  context: EviPageSliceContext;
};

/**
 * PhoneMockup-layout: telefon-mockups som selvstændig sektion. Hver
 * variation er ét `layout` på EviPhoneCarousel; box-fladen kommer fra Prismic-
 * labels (opløses i EviPhoneCarousel via resolve_phone_surface). Domain-part
 * (Tailwind tilladt, R3.3).
 */
export function PhoneMockupLayout({
  slice,
  index,
  context,
}: PhoneMockupLayoutProps): React.ReactElement | null {
  const { theme, isHero, collapsePadding, eagerImages } = resolve_slice_context(
    context,
    index,
  );

  // Fast antal: 3 navngivne felter (venstre/midt/højre); rækkefølgen = slots.
  const screenshots = [
    slice.primary.screenshot_left,
    slice.primary.screenshot_center,
    slice.primary.screenshot_right,
  ].filter((image) => isFilled.image(image));

  if (screenshots.length === 0) return null;

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="phone-mockup"
    >
      <EviPhoneCarousel
        layout={slice.variation}
        surface={slice.primary.box_background}
        fill={slice.primary.box_fill}
        eager={eagerImages}
        preload={isHero && screenshots.length === 1}
        fields={screenshots}
      />
    </EviSection>
  );
}
