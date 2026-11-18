// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content, ImageField } from "@prismicio/client";
import { h2, line, webLink } from "@/src/lib/preview/mockFields";
import type { FeedPage } from "@/src/lib/prismic/feed";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

// Kaffe-billeder fra Unsplash (side-verificeret free + commercial, 2026-07-16;
// samme som Features-mocken).
const img = (id: string): ImageField =>
  ({
    id: `mock-${id}`,
    url: `https://images.unsplash.com/photo-${id}?fit=crop&w=1200&h=675`,
    alt: null,
    copyright: null,
    dimensions: { width: 1200, height: 675 },
    edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
  }) as unknown as ImageField;

const NO_IMAGE: ImageField = {};

const page = (
  id: string,
  title: string,
  description: string,
  date: string,
  tags: string[],
  image?: string,
): FeedPage => ({
  id,
  parentId: "mock-blog",
  href: "/",
  title,
  description,
  image: image ? img(image) : NO_IMAGE,
  date,
  tags,
});

// Fuld-bredde sektion → block w-full (ellers kollapser grid'et i previewet).
export const previewWrapperClassName = "block w-full";

// Mock ejer sin egen preview-context: siden er "bloggen", kortene dens undersider.
export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
  lang: "da-dk",
  pageId: "mock-blog",
  feedPages: [
    page("mock-1", "Sådan brygger du den perfekte filterkaffe", "Vandtemperatur, malegrad og tid: tre ting, der gør hele forskellen.", "2026-10-02", ["Brygning"], "1529892485617-25f63cd7b1e9"),
    page("mock-2", "Nye bønner fra Etiopien", "Vores nye single origin smager af blåbær og jasmin.", "2026-09-14", ["Bønner"], "1559056199-641a0ac8b55e"),
    page("mock-3", "En dag på risteriet", "Fra grøn bønne klokken seks til frisk pose klokken to.", "2026-08-21", ["Bag kulisserne"]),
    page("mock-4", "Espresso derhjemme uden dyrt udstyr", "Du kommer langt med en god kværn og lidt tålmodighed.", "2026-07-30", ["Brygning"]),
  ],
};

export const mock: Record<string, Content.FeedSlice> = {
  default: {
    id: "mock-feed-default",
    slice_type: "feed",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Fra risteriet"),
      body: line("Guides til brygning, nyt om bønnerne og et kig bag kulisserne hos Kaffemølle Aarhus."),
      heading_align: "Venstre",
      parent_page: { link_type: "Document" } as unknown as Content.FeedSliceDefaultPrimary["parent_page"],
      limit: null,
      show_date: true,
      show_filters: true,
      card_cta: "Læs artikel",
      filter_legend: "Emne",
      filter_all: "Alle",
      filter_status: "{antal} artikler",
      cta_link: webLink("Se alle artikler"),
      background_theme: "Lys",
    },
  },
};
