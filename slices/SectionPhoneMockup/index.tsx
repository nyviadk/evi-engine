import { isFilled, type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { EviSection } from "@/src/components/layout/EviSection";
import {
  EviPhoneCarousel,
  type EviPhoneCarouselProps,
} from "@/src/components/ui/EviPhoneCarousel";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

// Prismic-label (Boks-baggrund) → EviPhoneCarousel surface-token.
const BOX_SURFACE: Record<string, EviPhoneCarouselProps["surface"]> = {
  Neutral: "neutral",
  Lys: "light",
  Mørk: "dark",
  "Primær tint": "primary",
  "Sekundær tint": "secondary",
  Ingen: "none",
};

// Prismic-label (Boks-fill) → EviPhoneCarousel fill.
const BOX_FILL: Record<string, EviPhoneCarouselProps["fill"]> = {
  Gradient: "gradient",
  Solid: "solid",
};

/**
 * SectionPhoneMockup — telefon-mockups som selvstændig sektion. Mockups er
 * et univers for sig selv (adskilt fra "billede + tekst"), så alt mockup
 * samles under denne ene slice; hvert look er en variation = ét `layout` på
 * EviPhoneCarousel. Start: "masked" (vifte med clippet bund).
 *
 * Tema/collapsePadding via cross-slice context (som HeroSimple); falder
 * tilbage til EviSections egne defaults i preview/standalone.
 */
export default function SectionPhoneMockup({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.SectionPhoneMockupSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );

  const screenshots = slice.primary.screenshots
    .map((item) => item.image)
    .filter((image) => isFilled.image(image));

  if (screenshots.length === 0) return null;

  const surface = BOX_SURFACE[slice.primary.box_background ?? ""] ?? "neutral";
  const fill = BOX_FILL[slice.primary.box_fill ?? ""] ?? "gradient";

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="section-phone-mockup"
    >
      <EviPhoneCarousel
        layout={slice.variation}
        surface={surface}
        fill={fill}
        fields={screenshots}
      />
    </EviSection>
  );
}
