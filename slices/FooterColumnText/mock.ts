// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content } from "@prismicio/client";
import { PERSONA } from "@/src/lib/preview/persona";
import type { EviFooterSliceContext } from "@/src/components/footer/types";

export const context: EviFooterSliceContext = {
  linkResolver: () => "/",
};

export const mock: Record<string, Content.FooterColumnTextSlice> = {
  default: {
    id: "mock-footer-column-text-default",
    slice_type: "footer_column_text",
    slice_label: null,
    variation: "default",
    version: "sktwi1xtmkfgx8626",
    items: [],
    primary: {
      heading: [
        {
          type: "heading3",
          text: "Åbningstider",
          spans: [],
          direction: "ltr",
        },
      ],
      body: PERSONA.hours.map((line) => ({
        type: "paragraph" as const,
        text: line,
        spans: [],
        direction: "ltr" as const,
      })) as Content.FooterColumnTextSliceDefaultPrimary["body"],
    },
  },
};
