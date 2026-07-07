// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Aldrig i produktion. Ingen kunde- eller persondata (fiktiv persona).
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content } from "@prismicio/client";
import { PERSONA } from "@/src/lib/preview/persona";
import type { EviFooterSliceContext } from "@/src/components/footer/types";

export const context: EviFooterSliceContext = {
  linkResolver: () => "/",
};

export const mock: Record<string, Content.FooterColumnLinksSlice> = {
  default: {
    id: "mock-footer-column-links-default",
    slice_type: "footer_column_links",
    slice_label: null,
    variation: "default",
    version: "sktwi1xtmkfgx8626",
    items: [],
    primary: {
      heading: [
        {
          type: "heading3",
          text: "Butik",
          spans: [],
          direction: "ltr",
        },
      ],
      links: PERSONA.nav.shop.map((label, i) => ({
        link_type: "Web" as const,
        url: "#",
        key: String(i + 1),
        text: label,
      })) as Content.FooterColumnLinksSliceDefaultPrimary["links"],
    },
  },
};
