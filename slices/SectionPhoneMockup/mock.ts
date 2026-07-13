// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content, ImageField } from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

// EviSection + den container-drevne carousel skal have fuld bredde for at
// folde kompositionen ud i preview — ellers kollapser inline-block-bredden.
export const previewWrapperClassName = "block w-full";

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

// 1080×2220 = 18:37, matcher EviPhoneMockup-frame og feltets constraint.
function screenshot(seed: string): ImageField {
  return {
    id: `mock-${seed}`,
    url: `https://picsum.photos/seed/${seed}/1080/2220`,
    alt: "App-screenshot",
    copyright: null,
    dimensions: { width: 1080, height: 2220 },
    edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
  } as unknown as ImageField;
}

export const mock: Record<string, Content.SectionPhoneMockupSlice> = {
  masked: {
    id: "mock-section-phone-mockup-masked",
    slice_type: "section_phone_mockup",
    slice_label: null,
    variation: "masked",
    version: "sktwi1xtmkfgx8626",
    items: [],
    primary: {
      background_theme: "Lys",
      box_background: "Primær tint",
      box_fill: "Gradient",
      screenshots: [
        { image: screenshot("evi-phone-1") },
        { image: screenshot("evi-phone-2") },
        { image: screenshot("evi-phone-3") },
      ],
    } as Content.SectionPhoneMockupSliceMaskedPrimary,
  },
};
