// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type {
  Content,
  ImageField,
  LinkField,
  RichTextField,
} from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

// Mock ejer sin egen preview-context.
export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser grid'et i previewet).
export const previewWrapperClassName = "block w-full";

const line = (text: string): RichTextField => [
  { type: "paragraph", text, spans: [], direction: "ltr" },
];
const h2 = (text: string): RichTextField => [
  { type: "heading2", text, spans: [], direction: "ltr" },
];
const h3 = (text: string): RichTextField => [
  { type: "heading3", text, spans: [], direction: "ltr" },
];

// Kaffe-billeder fra Unsplash (side-verificeret free + commercial, 2026-07-16),
// croppet til bento-feltets constraint.
const bentoImg = (id: string, w: number, h: number): ImageField =>
  ({
    id: `mock-${id}`,
    url: `https://images.unsplash.com/photo-${id}?fit=crop&w=${w}&h=${h}`,
    alt: null,
    copyright: null,
    dimensions: { width: w, height: h },
    edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
  }) as unknown as ImageField;

// allowText Web-link til preview-knapperne.
const webLink = (text: string): LinkField =>
  ({ link_type: "Web", url: "#", text }) as unknown as LinkField;

export const mock: Record<string, Content.SectionFeaturesSlice> = {
  split: {
    id: "mock-section-features-split",
    slice_type: "section_features",
    slice_label: null,
    variation: "split",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Håndværk i hver eneste kop"),
      body: line(
        "Vi går op i detaljen fra bønne til brew. Her er nogle af de ting du kan regne med, hver gang du handler hos os.",
      ),
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      image: {
        id: "mock-features-split-image",
        url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?fit=crop&w=1200&h=1200",
        alt: null,
        copyright: null,
        dimensions: { width: 1200, height: 1200 },
        edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
      } as Content.SectionFeaturesSliceSplitPrimary["image"],
      features: [
        {
          icon: "leaf",
          heading: h3("Sporbare bønner"),
          body: line("Vi kender hver farm og hver høst bag vores kaffe."),
        },
        {
          icon: "flame",
          heading: h3("Ristet på stedet"),
          body: line(
            "Alt ristes i vores eget værksted i Aarhus — aldrig ældre end en uge.",
          ),
        },
        {
          icon: "truck",
          heading: h3("Fri fragt over 300 kr."),
          body: line("Vi sender gratis på alle større ordrer, hurtigt og sikkert."),
        },
      ],
      feature_color: "Neutral",
      backdrop: "Ingen",
      image_side: "Venstre",
      mobile_order: "Billede øverst",
      background_theme: "Lys",
    },
  },
  cards: {
    id: "mock-section-features-cards",
    slice_type: "section_features",
    slice_label: null,
    variation: "cards",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Fra grøn bønne til perfekt kop"),
      body: line(
        "Vi følger kaffen hele vejen — fra farmeren til risteriet til din kande. Her er nogle af de ting vi går allermest op i.",
      ),
      cards: [
        {
          icon: "flame",
          heading: h3("Friskristet hver uge"),
          body: line(
            "Vi rister i små portioner, så bønnerne altid er friske når de når din kop.",
          ),
        },
        {
          icon: "sprout",
          heading: h3("Direkte fra farmeren"),
          body: line(
            "100% arabica, indkøbt direkte fra farmere vi kender ved navn.",
          ),
        },
        {
          icon: "graduation-cap",
          heading: h3("Kurser & smagninger"),
          body: line(
            "Lær at brygge den perfekte kop til vores hyggelige kaffekurser i butikken.",
          ),
        },
      ],
      card_color: "Sekundær",
      background_theme: "Lys",
    },
  },
  default: {
    id: "mock-section-features-default",
    slice_type: "section_features",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      feature_1_icon: "flame",
      feature_1_text: line("Ristet i Aarhus siden 2018"),
      feature_2_icon: "leaf",
      feature_2_text: line("100% arabica-bønner"),
      feature_3_icon: "truck",
      feature_3_text: line("Fri fragt over 300 kr."),
      feature_4_icon: "store",
      feature_4_text: line("Butik & webshop"),
      background_theme: "Lys",
    },
  },
  bento: {
    id: "mock-section-features-bento",
    slice_type: "section_features",
    slice_label: null,
    variation: "bento",
    version: "scaffold",
    items: [],
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    primary: {
      heading: h2("Mere end bare en kop kaffe"),
      body: line(
        "Fra risteri til webshop — her er nogle af de steder du kan møde Kaffemølle Aarhus.",
      ),
      card_1_image: bentoImg("1529892485617-25f63cd7b1e9", 1200, 1500),
      card_1_title: h3("Kom forbi vores risteri"),
      card_1_body: line(
        "Midt i Aarhus rister vi i små portioner hver uge. Kig ind, mærk duften og smag dig frem til din næste favorit.",
      ),
      card_1_link: webLink("Besøg risteriet"),
      card_2_title: h3("Friske bønner på abonnement"),
      card_2_body: line(
        "Vælg rytme og styrke — så leverer vi friskristede bønner direkte til døren, lige når du løber tør.",
      ),
      card_2_link: webLink("Se abonnementer"),
      card_2_image: bentoImg("1559056199-641a0ac8b55e", 1000, 1000),
      card_3_title: h3("Kaffekurser & smagninger"),
      card_3_body: line(
        "Lær at brygge den perfekte kop til vores hyggelige kurser i butikken.",
      ),
      card_3_link: webLink("Find en dato"),
      card_4_title: h3("Handl i webshoppen"),
      card_4_body: line(
        "Bønner, udstyr og gavekort — altid friskristet og sendt hurtigt afsted.",
      ),
      card_4_link: webLink("Gå til webshop"),
      background_theme: "Lys",
    } as Content.SectionFeaturesSliceBentoPrimary,
  },
};
