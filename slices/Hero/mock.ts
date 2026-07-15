// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content } from "@prismicio/client";
import { PERSONA } from "@/src/lib/preview/persona";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

// Begge variations previewes som hero → isHero: true (heading1 som h1 +
// hero-padding). Fuld-bredde wrapper: split's grid kollapser ellers.
export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "dark", isHero: true, collapsePadding: false }],
};
export const previewWrapperClassName = "block w-full";

export const mock: Record<string, Content.HeroSlice> = {
  centered: {
    id: "mock-hero-centered",
    slice_type: "hero",
    slice_label: null,
    variation: "centered",
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
        text: "Kom forbi",
      } as Content.HeroSliceCenteredPrimary["cta_link"],
      background_theme: "Lys",
    },
  },
  split: {
    id: "mock-hero-split",
    slice_type: "hero",
    slice_label: null,
    variation: "split",
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
      } as Content.HeroSliceSplitPrimary["cta_link"],
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
      } as Content.HeroSliceSplitPrimary["image"],
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      image_mobile: {
        id: "mock-hero-split-image-mobile",
        url: "https://picsum.photos/seed/herosplitm/1200/900",
        alt: null,
        copyright: null,
        dimensions: { width: 1200, height: 900 },
        edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
      } as Content.HeroSliceSplitPrimary["image_mobile"],
      backdrop: "Sekundær",
      background_theme: "Lys",
    },
  },
};
