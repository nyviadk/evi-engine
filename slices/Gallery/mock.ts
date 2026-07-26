// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Persona: "Kaffemølle Aarhus" (src/lib/preview/persona.ts). Se R4.7.

import type { Content } from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";
import { line, h2 } from "@/src/lib/preview/mockFields";

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser layoutet i previewet).
export const previewWrapperClassName = "block w-full";

type ItemImage = Content.GallerySliceDefaultPrimaryItemsItem["image"];
type Caption = Content.GallerySliceDefaultPrimaryItemsItem["caption"];

// Genbrugte, accepterede Unsplash-billeder fra tidligere mocks — croppet pr. felt
// (feature 16:9, grid 4:3) så de matcher constraints.
const img = (id: string, w: number, h: number): ItemImage =>
  ({
    id: `mock-${id}`,
    url: `https://images.unsplash.com/photo-${id}?fit=crop&w=${w}&h=${h}`,
    alt: null,
    copyright: null,
    dimensions: { width: w, height: h },
    edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
  }) as unknown as ItemImage;

const noCaption = [] as unknown as Caption;

const A = "1529892485617-25f63cd7b1e9"; // latte art (top-down)
const B = "1495474472287-4d71bcdd2085"; // fælles kaffepause
const C = "1559056199-641a0ac8b55e"; // kaffepose / risteri

export const mock: Record<string, Content.GallerySlice> = {
  default: {
    id: "mock-gallery-default",
    slice_type: "gallery",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Et kig ind i risteriet"),
      body: line(
        "Fra grønne bønner til den færdige kop — her er et par glimt fra hverdagen i Kaffemølle Aarhus.",
      ),
      feature_image: img(
        C,
        1600,
        900,
      ) as unknown as Content.GallerySliceDefaultPrimary["feature_image"],
      feature_caption: line(
        "Vores lille risteri midt i Aarhus, hvor alt ristes i små portioner hver uge.",
      ),
      items: [
        { image: img(A, 1200, 900), caption: line("Latte art fra vores baristaer") },
        { image: img(B, 1200, 900), caption: line("Fælles kaffepause om morgenen") },
        { image: img(C, 1200, 900), caption: noCaption },
        { image: img(A, 1200, 900), caption: line("Friskristede bønner, klar til brug") },
        { image: img(B, 1200, 900), caption: noCaption },
        { image: img(C, 1200, 900), caption: line("Pakket og klar til levering") },
      ],
      background_theme: "Lys",
    },
  },
};
