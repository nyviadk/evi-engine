import { isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import {
  EviBackdropImage,
  BACKDROP_FROM_LABEL,
} from "@/src/components/ui/EviBackdropImage";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

export type HeroAboutLayoutProps = {
  slice: Content.HeroSliceAbout;
  index: number;
  context: EviPageSliceContext;
};

/**
 * Hero-variation "about": simpel 2-kolonne bio-hero — billede + overskrift +
 * længere brødtekst. `image_side` styrer billedets side (desktop), `mobile_order`
 * rækkefølgen på mobil. Domain-part (Tailwind tilladt, R3.3); rendres af Hero-
 * dispatcheren via dynamic import.
 *
 * a11y: DOM leder ALTID med indholdet (overskrift først → bedst for skærmlæser +
 * heading-navigation); billed-side + mobil-rækkefølge er PURT visuelle via
 * EviSplit's CSS-`order` (fokus/læse-rækkefølge uændret, sikkert da billed-
 * blokken ikke har fokuserbare børn).
 */
export function HeroAboutLayout({
  slice,
  index,
  context,
}: HeroAboutLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  if (
    !isFilled.richText(p.heading) &&
    !isFilled.richText(p.body) &&
    !isFilled.image(p.image)
  ) {
    return null;
  }

  const imageLeftOnDesktop = p.image_side !== "Højre";
  const imageTopOnMobile = p.mobile_order !== "Tekst øverst";
  const backdrop = BACKDROP_FROM_LABEL[p.backdrop ?? "Roteret"] ?? "rotated";

  const contentEl = (
    <EviHeadingGroup
      title={p.heading}
      description={p.body}
      linkResolver={linkResolver}
      isHero={isHero}
    />
  );
  const imageEl = (
    <EviBackdropImage
      field={p.image}
      backdrop={backdrop}
      color={p.backdrop_color}
      priority={isHero}
    />
  );

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="hero-about"
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
