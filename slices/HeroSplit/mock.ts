// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content } from "@prismicio/client";
import { PERSONA } from "@/src/lib/preview/persona";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

// Hero → isHero: true (heading1 som h1 + hero-padding på EviSection).
export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: true, collapsePadding: false }],
};

// Fuld-bredde preview-wrapper: EviSection→EviSplit's grid kollapser i den
// default inline-block-wrapper — som SectionPhoneMockup skal den have en
// bredde-defineret parent.
export const previewWrapperClassName = "block w-full";

export const mock: Record<string, Content.HeroSplitSlice> = {
  default: {
    id: "mock-hero-split-default",
    slice_type: "hero_split",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      heading: [
        { type: "heading1", text: PERSONA.brand, spans: [], direction: "ltr" },
      ],
      body: [
        {
          type: "paragraph",
          text: PERSONA.tagline,
          spans: [],
          direction: "ltr",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      cta_link: {
        link_type: "Web" as const,
        url: "#",
        text: "Se menukort",
      } as Content.HeroSplitSliceDefaultPrimary["cta_link"],
      tag_icon: "ph:coffee",
      tag_text: [
        {
          type: "paragraph",
          text: "Ristet i Aarhus siden 2018",
          spans: [],
          direction: "ltr",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      image: {
        id: "mock-hero-split-image",
        url: "https://picsum.photos/seed/herosplit/1200/1200",
        alt: null,
        copyright: null,
        dimensions: { width: 1200, height: 1200 },
        edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
      } as Content.HeroSplitSliceDefaultPrimary["image"],
      backdrop: "Sekundær",
      background_theme: "Lys",
    },
  },
};
