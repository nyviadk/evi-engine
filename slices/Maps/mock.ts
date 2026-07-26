// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Persona: "Kaffemølle Aarhus" (src/lib/preview/persona.ts). Se R4.7.

import type { Content } from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";
import { line, h2, h3 } from "@/src/lib/preview/mockFields";

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser splittet i previewet).
export const previewWrapperClassName = "block w-full";

// Placeholder-kort (picsum, gråtone) — i praksis uploader kunden et rigtigt
// kort-screenshot. First-party billede → ingen tredjeparts-load/cookies.
const mapImg = {
  id: "mock-maps-image",
  url: "https://picsum.photos/seed/kort-aarhus/1200/900?grayscale",
  alt: null,
  copyright: null,
  dimensions: { width: 1200, height: 900 },
  edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
} as unknown as Content.MapsSliceDefaultPrimary["map_image"];

export const mock: Record<string, Content.MapsSlice> = {
  default: {
    id: "mock-maps-default",
    slice_type: "maps",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Kom forbi risteriet"),
      body: line(
        "Du finder os midt i Aarhus — kig ind til en snak, en smagning eller bare en god kop kaffe.",
      ),
      heading_align: "Venstre",
      map_image: mapImg,
      box_heading: h3("Butik & risteri"),
      // Fiktiv adresse (ingen ægte adresser i mock-data).
      address: line("Kaffevej 12\n8000 Aarhus C"),
      info_items: [
        { icon: "car", text: line("Gratis parkering lige ved døren") },
        { icon: "train-front", text: line("5 min. gang fra stationen") },
        { icon: "clock", text: line("Åbent man–fre 8–17 · lør 9–15") },
      ],
      google_maps_label: "Åbn Google Maps",
      apple_maps_label: "Åbn Apple Maps",
      background_theme: "Lys",
    },
  },
};
