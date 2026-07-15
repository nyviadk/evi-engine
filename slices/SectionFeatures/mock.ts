// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content, RichTextField } from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

// Mock ejer sin egen preview-context.
export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser grid'et i previewet).
export const previewWrapperClassName = "block w-full";

const line = (text: string): RichTextField => [
  { type: "paragraph", text, spans: [], direction: "ltr" },
];

export const mock: Record<string, Content.SectionFeaturesSlice> = {
  default: {
    id: "mock-section-features-default",
    slice_type: "section_features",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      feature_1_icon: "flame",
      feature_1_text: line("Ristet i Aarhus siden 2018"),
      feature_2_icon: "leaf",
      feature_2_text: line("100% arabica-bønner"),
      feature_3_icon: "truck",
      feature_3_text: line("Fri fragt over 300 kr."),
      feature_4_icon: "store",
      feature_4_text: line("Butik & webshop"),
      background_theme: "Lys",
    },
  },
};
