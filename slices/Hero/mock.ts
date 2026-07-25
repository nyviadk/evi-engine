// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content } from "@prismicio/client";
import { PERSONA } from "@/src/lib/preview/persona";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

// Begge variations previewes som hero → isHero: true (heading1 som h1 +
// hero-padding). Fuld-bredde wrapper: split's grid kollapser ellers.
export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: true, collapsePadding: false }],
};
export const previewWrapperClassName = "block w-full";

export const mock: Record<string, Content.HeroSlice> = {
  centered: {
    id: "mock-hero-centered",
    slice_type: "hero",
    slice_label: null,
    variation: "centered",
    version: "scaffold",
    items: [],
    primary: {
      heading: [
        { type: "heading1", text: PERSONA.brand, spans: [], direction: "ltr" },
      ],
      body: [
        {
          type: "paragraph",
          text: PERSONA.tagline,
          spans: [],
          direction: "ltr",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      cta_link: {
        link_type: "Web" as const,
        url: "#",
        text: "Kom forbi",
      } as Content.HeroSliceCenteredPrimary["cta_link"],
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      cta_link_secondary: {
        link_type: "Web" as const,
        url: "#",
        text: "Læs mere",
      } as Content.HeroSliceCenteredPrimary["cta_link_secondary"],
      background_theme: "Lys",
    },
  },
  split: {
    id: "mock-hero-split",
    slice_type: "hero",
    slice_label: null,
    variation: "split",
    version: "scaffold",
    items: [],
    primary: {
      heading: [
        { type: "heading1", text: PERSONA.brand, spans: [], direction: "ltr" },
      ],
      body: [
        {
          type: "paragraph",
          text: PERSONA.tagline,
          spans: [],
          direction: "ltr",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      cta_link: {
        link_type: "Web" as const,
        url: "#",
        text: "Se menukort",
      } as Content.HeroSliceSplitPrimary["cta_link"],
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      cta_link_secondary: {
        link_type: "Web" as const,
        url: "#",
        text: "Bestil bord",
      } as Content.HeroSliceSplitPrimary["cta_link_secondary"],
      tag_icon: "ph:coffee",
      tag_text: [
        {
          type: "paragraph",
          text: "Ristet i Aarhus siden 2018",
          spans: [],
          direction: "ltr",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      image: {
        id: "mock-hero-split-image",
        url: "https://images.unsplash.com/photo-1529892485617-25f63cd7b1e9?fit=crop&w=1200&h=1200",
        alt: null,
        copyright: null,
        dimensions: { width: 1200, height: 1200 },
        edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
      } as Content.HeroSliceSplitPrimary["image"],
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      image_mobile: {
        id: "mock-hero-split-image-mobile",
        url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?fit=crop&w=1200&h=900",
        alt: null,
        copyright: null,
        dimensions: { width: 1200, height: 900 },
        edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
      } as Content.HeroSliceSplitPrimary["image_mobile"],
      backdrop: "Roteret",
      backdrop_color: "Sekundær",
      background_theme: "Lys",
    },
  },
  about: {
    id: "mock-hero-about",
    slice_type: "hero",
    slice_label: null,
    variation: "about",
    version: "scaffold",
    items: [],
    primary: {
      heading: [
        {
          type: "heading1",
          text: "Ristet med omhu i hjertet af Aarhus",
          spans: [],
          direction: "ltr",
        },
      ],
      body: [
        {
          type: "paragraph",
          text: "Kaffemølle Aarhus startede i 2018 som et lille risteri med én tromle og en stædig idé: at kaffe smager bedst, når man kender hele rejsen fra farm til kop.",
          spans: [],
          direction: "ltr",
        },
        {
          type: "paragraph",
          text: "I dag rister vi stadig i små portioner hver uge, køber direkte fra farmere vi kender ved navn, og deler ud af vores viden til smagninger og kurser i butikken. Det handler ikke bare om koffein — det handler om håndværk, mennesker og den gode stund.",
          spans: [],
          direction: "ltr",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      cta_link: {
        link_type: "Web" as const,
        url: "#",
        text: "Besøg butikken",
      } as Content.HeroSliceAboutPrimary["cta_link"],
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      cta_link_secondary: {
        link_type: "Web" as const,
        url: "#",
        text: "Book en smagning",
      } as Content.HeroSliceAboutPrimary["cta_link_secondary"],
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      image: {
        id: "mock-hero-about-image",
        url: "https://images.unsplash.com/photo-1529892485617-25f63cd7b1e9?fit=crop&w=1000&h=1000",
        alt: null,
        copyright: null,
        dimensions: { width: 1000, height: 1000 },
        edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
      } as Content.HeroSliceAboutPrimary["image"],
      backdrop: "Roteret",
      backdrop_color: "Sekundær",
      image_side: "Venstre",
      mobile_order: "Billede øverst",
      background_theme: "Lys",
    },
  },
};
