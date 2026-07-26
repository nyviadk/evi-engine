// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content } from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";
import { line, h2, h3, webLink } from "@/src/lib/preview/mockFields";

// Mock ejer sin egen preview-context.
export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser layoutet i previewet).
export const previewWrapperClassName = "block w-full";

const faq = (question: string, answer: string) => ({
  question: h3(question),
  answer: line(answer),
});

export const mock: Record<string, Content.FaqSlice> = {
  default: {
    id: "mock-faq-default",
    slice_type: "faq",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    primary: {
      heading: h2("Ofte stillede spørgsmål"),
      body: line(
        "Alt du behøver at vide om vores bønner, abonnementer og levering.",
      ),
      cta_link: webLink("Kontakt os"),
      items: [
        faq(
          "Hvor friske er jeres bønner?",
          "Vi rister i små portioner hver uge, så bønnerne aldrig er ældre end syv dage når de sendes fra risteriet i Aarhus.",
        ),
        faq(
          "Kan jeg pause eller ændre mit abonnement?",
          "Ja — du styrer selv rytme, mængde og styrke på din konto og kan pause eller opsige når som helst, uden binding.",
        ),
        faq(
          "Hvornår får jeg min ordre?",
          "Bestiller du inden kl. 12 på en hverdag, pakker vi samme dag. Fri fragt på ordrer over 300 kr., ellers 39 kr.",
        ),
        faq(
          "Hvilke bryggemetoder passer bønnerne til?",
          "Alle vores blends fungerer til både stempelkande, filter og espresso — vi angiver en anbefalet metode på hver pose.",
        ),
        faq(
          "Kan man købe gavekort?",
          "Ja, digitale gavekort kan købes i webshoppen og bruges på både bønner, udstyr og vores kaffekurser.",
        ),
      ],
      heading_align: "Centreret",
      background_theme: "Lys",
    } as Content.FaqSliceDefaultPrimary,
  },
};
