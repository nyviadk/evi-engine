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
// Kaffe-billeder fra Unsplash (gratis + commercial), croppet til telefon-format.
function screenshot(unsplashId: string): ImageField {
  return {
    id: `mock-${unsplashId}`,
    url: `https://images.unsplash.com/photo-${unsplashId}?fit=crop&w=1080&h=2220`,
    alt: "Kaffe-app screenshot",
    copyright: null,
    dimensions: { width: 1080, height: 2220 },
    edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
  } as unknown as ImageField;
}

export const mock: Record<string, Content.PhoneMockupSlice> = {
  masked: {
    id: "mock-phone-mockup-masked",
    slice_type: "phone_mockup",
    slice_label: null,
    variation: "masked",
    version: "sktwi1xtmkfgx8626",
    items: [],
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    primary: {
      background_theme: "Lys",
      box_background: "Primær tint",
      box_fill: "Gradient",
      screenshot_left: screenshot("1529892485617-25f63cd7b1e9"),
      screenshot_center: screenshot("1495474472287-4d71bcdd2085"),
      screenshot_right: screenshot("1559056199-641a0ac8b55e"),
    } as Content.PhoneMockupSliceMaskedPrimary,
  },
};
