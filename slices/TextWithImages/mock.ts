// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Persona: "Kaffemølle Aarhus" (src/lib/preview/persona.ts). Se R4.7.

import type { Content } from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";
import { h2, paras, webLink } from "@/src/lib/preview/mockFields";

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser splittet i previewet).
export const previewWrapperClassName = "block w-full";

// Genbrugte, accepterede Unsplash-billeder fra tidligere mocks — croppet 3:4.
const A = "1529892485617-25f63cd7b1e9"; // latte art (top-down)
const B = "1495474472287-4d71bcdd2085"; // fælles kaffepause
const C = "1559056199-641a0ac8b55e"; // kaffepose / risteri
const D = "1447933601403-0c6688de566e"; // kaffebønner (makro)

const pimg = (
  id: string,
): Content.TextWithImagesSliceCollagePrimary["image_1"] =>
  ({
    id: `mock-twi-${id}`,
    url: `https://images.unsplash.com/photo-${id}?fit=crop&w=900&h=1200`,
    alt: null,
    copyright: null,
    dimensions: { width: 900, height: 1200 },
    edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
  }) as unknown as Content.TextWithImagesSliceCollagePrimary["image_1"];

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
      body: paras(
        "Hver bønne vi rister har rejst langt. Vi køber direkte fra farmere vi kender, rister i små portioner og smager os frem til den profil der lige præcis får den kaffe til at skinne.",
        "Kig forbi risteriet en onsdag, hvor tromlen kører — så skænker vi gerne en kop og fortæller historien bag den bønne, du står med i hånden.",
      ),
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
  collage: {
    id: "mock-text-with-images-collage",
    slice_type: "text_with_images",
    slice_label: null,
    variation: "collage",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Håndristet i små portioner"),
      body: paras(
        "Vi rister i små hold, så hver bønne får præcis den profil den fortjener — aldrig masseproduceret, altid friskt.",
        "Kig forbi og smag forskellen på kaffe, der er ristet i denne uge.",
      ),
      cta_link: webLink("Se vores bønner"),
      image_1: pimg(A),
      image_2: pimg(B),
      image_3: pimg(C),
      image_4: pimg(D),
      image_side: "Venstre",
      mobile_order: "Billede øverst",
      background_theme: "Lys",
    },
  },
  duo: {
    id: "mock-text-with-images-duo",
    slice_type: "text_with_images",
    slice_label: null,
    variation: "duo",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Menneskene bag kaffen"),
      body: paras(
        "Fra farmeren vi handler direkte med, til baristaen der skænker din kop — Kaffemølle Aarhus er bygget på relationer og respekt for håndværket.",
      ),
      cta_link: webLink("Læs vores historie"),
      image_1: pimg(B),
      image_2: pimg(C),
      image_side: "Højre",
      mobile_order: "Billede øverst",
      background_theme: "Lys",
    },
  },
};
