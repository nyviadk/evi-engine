// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content } from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";
import { line, h2, h3 } from "@/src/lib/preview/mockFields";

// Mock ejer sin egen preview-context.
export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser layoutet i previewet).
export const previewWrapperClassName = "block w-full";

const point = (icon: string, title: string, body: string) => ({
  icon,
  title: h3(title),
  body: line(body),
});

export const mock: Record<string, Content.HighlightsSlice> = {
  default: {
    id: "mock-highlights-default",
    slice_type: "highlights",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    primary: {
      heading: h2("Kvalitet du kan smage"),
      body: [
        {
          type: "paragraph",
          text: "For os handler god kaffe om at kende hele rejsen — fra den farm hvor bønnen gror, til den tromle vi rister i, til den kop du drikker.",
          spans: [],
          direction: "ltr",
        },
        {
          type: "paragraph",
          text: "Vi går på kompromis med hastigheden, ikke smagen. Små portioner, tætte relationer til farmerne og en risteprofil vi finjusterer for hver enkelt bønne.",
          spans: [],
          direction: "ltr",
        },
        {
          type: "paragraph",
          text: "Det tager længere tid, og det koster lidt mere. Men det er forskellen på en kop kaffe, der bare vækker dig, og en du faktisk glæder dig til.",
          spans: [],
          direction: "ltr",
        },
        {
          type: "paragraph",
          text: "Kig forbi risteriet en onsdag, hvor tromlen kører — så skal vi nok skænke en kop og fortælle historien bag den bønne, du står med i hånden.",
          spans: [],
          direction: "ltr",
        },
      ],
      points: [
        point(
          "leaf",
          "Direkte handel",
          "Vi køber bønnerne direkte fra farmere vi kender ved navn — bedre kvalitet og en fair pris hele vejen.",
        ),
        point(
          "flame",
          "Friskristet i Aarhus",
          "Alt ristes i små portioner hver uge, så det aldrig er ældre end syv dage når det når din kop.",
        ),
      ],
      box_color: "Neutral",
      background_theme: "Lys",
    } as Content.HighlightsSliceDefaultPrimary,
  },
};
