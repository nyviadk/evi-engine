// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Persona: "Kaffemølle Aarhus" (src/lib/preview/persona.ts). Se R4.7.

import type {
  Content,
  RichTextField,
  RTInlineNode,
  RTNode,
} from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";
import { line, paras, h2, h3, h4 } from "@/src/lib/preview/mockFields";
import { PERSONA } from "@/src/lib/preview/persona";

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

// Et dokument er sidens første slice, så titlen er sidens h1.
export const contexts: Record<string, EviPageSliceContext> = {
  document: {
    ...context,
    sliceContexts: [{ theme: "light", isHero: true, collapsePadding: false }],
    lastPublished: "2026-03-01",
  },
};

// Fuld-bredde sektion → block w-full (ellers kollapser splittet i previewet).
export const previewWrapperClassName = "block w-full";

const block = (
  type: "heading2" | "heading3" | "paragraph" | "list-item",
  text: string,
  spans: RTInlineNode[] = [],
): RTNode => ({ type, text, spans, direction: "ltr" });

// Dokument-variationens tekst: overskrifter, en liste, fed tekst og et link.
const NO_SALE = "Vi sælger aldrig dine oplysninger.";
const COLLECT = `Når du bestiller hos os, gemmer vi dit navn, din adresse og din e-mail, så vi kan sende din kaffe. ${NO_SALE}`;
const EMAIL = PERSONA.contact.email;
const RIGHTS = `Du kan altid se, rette eller slette dine oplysninger. Skriv til ${EMAIL}, så hjælper vi dig.`;
const DOCUMENT: RichTextField = [
  block("heading2", "1. Hvilke oplysninger vi gemmer"),
  block("paragraph", COLLECT, [
    { type: "strong", start: COLLECT.indexOf(NO_SALE), end: COLLECT.length },
  ]),
  block("heading3", "Når du har et abonnement"),
  block("list-item", "Hvilke bønner du får"),
  block("list-item", "Hvor ofte vi sender"),
  block("list-item", "Hvornår du sætter på pause"),
  block("heading2", "2. Dine rettigheder"),
  block("paragraph", RIGHTS, [
    {
      type: "hyperlink",
      start: RIGHTS.indexOf(EMAIL),
      end: RIGHTS.indexOf(EMAIL) + EMAIL.length,
      data: { link_type: "Web", url: `mailto:${EMAIL}` },
    },
  ]),
];

export const mock: Record<string, Content.TextContentSlice> = {
  default: {
    id: "mock-text-content-default",
    slice_type: "text_content",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Fra bønne til kop"),
      body: line(
        "Vi tror på gennemsigtighed i hvert led — her er hvordan vi arbejder, og hvad du kan forvente.",
      ),
      heading_align: "Centreret",
      left_heading: h3("Vores tilgang"),
      left_body: paras(
        "Vi køber direkte fra farmerne og betaler over markedspris for de bedste høster. Det giver bedre kaffe i koppen — og en mere fair handel for dem, der dyrker den.",
        "Alt bliver ristet i små portioner på vores eget værksted i Aarhus, aldrig mere end en uge før det når dig. Vi rister efter bønnens egen profil frem for én fast opskrift.",
        "Når kaffen er klar, pakker og sender vi inden for 48 timer, så friskheden følger hele vejen hjem til din kværn.",
      ),
      box_title: h4("Godt at vide"),
      box_body: paras(
        "Alle vores bønner er sporbare til den enkelte farm — scan QR-koden på posen og se præcis, hvor din kaffe kommer fra, og hvem der har dyrket den.",
        "Er du ny i specialkaffe, følger der en lille bryggeguide med i hver pose.",
      ),
      box_color: "Neutral",
      right_heading: h3("Hvad du kan forvente"),
      right_body: paras(
        "Friskristet kaffe med en smagsprofil, der matcher din smag — fra lyse, frugtige ristninger til mørke og fyldige.",
        "Er du i tvivl, hjælper vi dig gerne med at finde den rette ristning og bryggemetode til lige netop dit udstyr.",
        "Med et abonnement får du automatisk nye bønner, når du er ved at løbe tør — sæt på pause eller opsig når som helst.",
      ),
      background_theme: "Lys",
    },
  },
  document: {
    id: "mock-text-content-document",
    slice_type: "text_content",
    slice_label: null,
    variation: "document",
    version: "scaffold",
    items: [],
    primary: {
      tag_icon: null,
      tag_text: line("Det med småt"),
      heading: h2("Privatlivspolitik"),
      date_display: "Senest opdateret",
      image: {},
      image_display: "Med skygge",
      body: line(
        `Her kan du læse, hvilke oplysninger ${PERSONA.brand} gemmer, når du handler hos os, og hvad vi bruger dem til.`,
      ),
      content: DOCUMENT,
      background_theme: "Lys",
    },
  },
};
