// Delte felt-fabrikker til slice-mocks (KUN preview-generering). Rich-text- og
// link-felter der før var kopieret ind i hver mock. Se R4.7 i regelbogen.

import type { LinkField, RichTextField } from "@prismicio/client";

export const line = (text: string): RichTextField => [
  { type: "paragraph", text, spans: [], direction: "ltr" },
];

export const paras = (...texts: string[]): RichTextField =>
  texts.map((text) => ({
    type: "paragraph",
    text,
    spans: [],
    direction: "ltr",
  })) as RichTextField;

export const h2 = (text: string): RichTextField => [
  { type: "heading2", text, spans: [], direction: "ltr" },
];

export const h3 = (text: string): RichTextField => [
  { type: "heading3", text, spans: [], direction: "ltr" },
];

export const h4 = (text: string): RichTextField => [
  { type: "heading4", text, spans: [], direction: "ltr" },
];

export const webLink = (text: string): LinkField =>
  ({ link_type: "Web", url: "#", text }) as unknown as LinkField;
