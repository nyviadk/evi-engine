// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content, ImageField } from "@prismicio/client";
import { context as classic_context } from "@/slices/HeaderClassic/mock";
import type { EviHeaderSliceContext } from "@/src/components/header/types";
import { webLink } from "@/src/lib/preview/mockFields";
import type { EviContext } from "@/src/lib/prismic/context";

type Primary = Content.PlanioHeaderSliceDefaultPrimary;

// Samme minimale header-context som classic-headeren, men med My Planios navn.
export const context: EviHeaderSliceContext = {
  ...classic_context,
  settings: {
    data: { site_name: "My Planio" },
  } as unknown as EviContext["settings"],
};

export const previewWrapperClassName = "block w-full";

// App-ikonet i myplanio-repoets mediebibliotek.
const ICON: ImageField = {
  id: "HJ4pvf22y67U8NWG",
  url: "https://images.prismic.io/myplanio/HJ4pvf22y67U8NWG_my-planio-app-icon.png?auto=format,compress",
  alt: null,
  copyright: null,
  dimensions: { width: 192, height: 192 },
  edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
};

// Designets menu (pladsholdere). Gentagne links skal have en nøgle.
const menu = (text: string): Primary["nav_groups"][number] => ({
  links: [{ link_type: "Web", url: "#", text, key: text }],
});

export const mock: Record<string, Content.PlanioHeaderSlice> = {
  default: {
    id: "mock-planio_header-default",
    slice_type: "planio_header",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      icon: ICON,
      cta_link: webLink<Primary["cta_link"]>("Hent appen"),
      nav_groups: [
        menu("Sådan virker det"),
        menu("Funktioner"),
        menu("Fremtiden"),
        menu("Om os"),
      ],
    },
  },
};
