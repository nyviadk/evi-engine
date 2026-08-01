// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Persona: "Kaffemølle Aarhus" (src/lib/preview/persona.ts). Se R4.7.

import type { Content } from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";
import { line } from "@/src/lib/preview/mockFields";

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser splittet i previewet).
export const previewWrapperClassName = "block w-full";

const portraitImg = {
  id: "mock-profile-portrait",
  url: "https://picsum.photos/seed/mette-kaffe/800/800",
  alt: null,
  copyright: null,
  dimensions: { width: 800, height: 800 },
  edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
} as unknown as Content.ProfileSliceDefaultPrimary["portrait"];

// Signatur som data-URI-SVG (i praksis uploader kunden sin egen). Vises via rå
// <img> — ingen fetch/inline.
const signatureImg = {
  link_type: "Media",
  url: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20220%2070'%3E%3Ctext%20x='4'%20y='52'%20font-family='Segoe%20Script,Brush%20Script%20MT,cursive'%20font-style='italic'%20font-size='54'%20fill='%230d5c63'%3EMette%3C/text%3E%3C/svg%3E",
  kind: "image",
  name: "signatur.svg",
  size: "600",
  height: null,
  width: null,
} as unknown as Content.ProfileSliceDefaultPrimary["signature"];

export const mock: Record<string, Content.ProfileSlice> = {
  default: {
    id: "mock-profile-default",
    slice_type: "profile",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      portrait: portraitImg,
      description: line(
        "Mange tror, god kaffe skal være kompliceret — dyre maskiner og fine ord. Sådan ser vi det ikke. Vi startede Kaffemølle for at gøre friskristet specialkaffe til hverdagskaffe, alle kan have stående derhjemme.",
      ),
      quote: line("»Kaffe skal smage af omtanke — ikke af salgstale.«"),
      signature: signatureImg,
      signature_name: "Mette",
      role: line("Grundlægger & rister, Kaffemølle Aarhus"),
      background_theme: "Lys",
    },
  },
};
