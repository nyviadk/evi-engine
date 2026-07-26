// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Persona: "Kaffemølle Aarhus" (src/lib/preview/persona.ts). Se R4.7.

import type { Content } from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";
import { h2 } from "@/src/lib/preview/mockFields";

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser splittet i previewet).
export const previewWrapperClassName = "block w-full";

export const mock: Record<string, Content.TextWithImagesSlice> = {
  default: {
    id: "mock-text-with-images-default",
    slice_type: "text_with_images",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Fra grøn bønne til den perfekte kop"),
      body: [
        {
          type: "paragraph",
          text: "Hver bønne vi rister har rejst langt. Vi køber direkte fra farmere vi kender, rister i små portioner og smager os frem til den profil der lige præcis får den kaffe til at skinne.",
          spans: [],
          direction: "ltr",
        },
        {
          type: "paragraph",
          text: "Kig forbi risteriet en onsdag, hvor tromlen kører — så skænker vi gerne en kop og fortæller historien bag den bønne, du står med i hånden.",
          spans: [],
          direction: "ltr",
        },
      ],
      // Genbrugt fra Hero-mock (samme accepterede Unsplash-billede), croppet 4:3.
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      image: {
        id: "mock-text-with-images-image",
        url: "https://images.unsplash.com/photo-1529892485617-25f63cd7b1e9?fit=crop&ar=4:3&w=1200",
        alt: null,
        copyright: null,
        dimensions: { width: 1200, height: 900 },
        edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
      } as Content.TextWithImagesSliceDefaultPrimary["image"],
      image_display: "Rammet",
      image_side: "Venstre",
      mobile_order: "Billede øverst",
      background_theme: "Lys",
    },
  },
};
