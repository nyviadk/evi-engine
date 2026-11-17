// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md). planio_-slices må bruge
// My Planio-indhold (fra forside-designet) i stedet for PERSONA.

import type { Content, RichTextField } from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";
import { h2 } from "@/src/lib/preview/mockFields";

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "dark", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser splittet i previewet).
export const previewWrapperClassName = "block w-full";

const photo = {
  id: "OQXbh86zPRuFzXN9",
  url: "https://images.prismic.io/myplanio/OQXbh86zPRuFzXN9_sebastian-og-yannik.jpg?auto=format,compress",
  alt: "Sebastian og Yannik, der står bag My Planio",
  copyright: null,
  dimensions: { width: 1100, height: 661 },
  edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
} as unknown as Content.PlanioAboutSliceDefaultPrimary["image"];

const linkedin = "Følg med på LinkedIn";
const body: RichTextField = [
  { type: "paragraph", text: "“Skal jeg så ikke bare lave den til dig?”", spans: [], direction: "ltr" },
  {
    type: "paragraph",
    text: "I dag bygger Sebastian og Yannik My Planio i Aarhus, sammen med brugerne.",
    spans: [],
    direction: "ltr",
  },
  {
    type: "paragraph",
    text: linkedin,
    spans: [
      {
        type: "hyperlink",
        start: 0,
        end: linkedin.length,
        data: { link_type: "Web", url: "https://www.linkedin.com/company/my-planio/", target: "_blank" },
      },
    ],
    direction: "ltr",
  },
];

export const mock: Record<string, Content.PlanioAboutSlice> = {
  default: {
    id: "mock-planio_about-default",
    slice_type: "planio_about",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Det startede med ét spørgsmål"),
      body,
      image: photo,
      background_theme: "Mørk",
    },
  },
};
