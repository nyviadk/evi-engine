// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content } from "@prismicio/client";
import { PERSONA } from "@/src/lib/preview/persona";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
};

export const mock: Record<string, Content.HeroSimpleSlice> = {
  default: {
    id: "mock-hero-simple-default",
    slice_type: "hero_simple",
    slice_label: null,
    variation: "default",
    version: "sktwi1xtmkfgx8626",
    items: [],
    primary: {
      heading: [
        {
          type: "heading1",
          text: PERSONA.brand,
          spans: [],
          direction: "ltr",
        },
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
      } as Content.HeroSimpleSliceDefaultPrimary["cta_link"],
      background_theme: "Lys",
    },
  },
};
