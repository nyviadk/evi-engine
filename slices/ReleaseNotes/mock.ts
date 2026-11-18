// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content, RichTextField } from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";
import { line, h2, h3, webLink } from "@/src/lib/preview/mockFields";

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  lang: "da-dk",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser layoutet i previewet).
export const previewWrapperClassName = "block w-full";

const items = (...texts: string[]): RichTextField =>
  texts.map((text) => ({
    type: "list-item",
    text,
    spans: [],
    direction: "ltr",
  })) as RichTextField;

const release = (
  version: string,
  release_date: string,
  title: string,
  notes: RichTextField,
) => ({ version, release_date, title: h3(title), notes });

export const mock: Record<string, Content.ReleaseNotesSlice> = {
  default: {
    id: "mock-release-notes-default",
    slice_type: "release_notes",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    primary: {
      heading: h2("Nyt i webshoppen"),
      body: line(
        "Vi forbedrer løbende webshoppen, så det bliver nemmere at bestille bønner fra risteriet i Aarhus.",
      ),
      heading_align: "Centreret",
      cta_link: webLink("Skriv til os"),
      releases: [
        release(
          "2.1",
          "2026-10-02",
          "Gavekort i webshoppen",
          items(
            "Digitale gavekort kan nu købes direkte i kurven.",
            "Gavekort kan bruges på bønner, udstyr og kaffekurser.",
          ),
        ),
        release(
          "2.2",
          "2026-11-12",
          "Pause dit abonnement med ét klik",
          items(
            "Du kan nu sætte dit abonnement på pause fra din konto.",
            "Leveringsdatoen vises på forsiden af din konto.",
          ),
        ),
        release(
          "2.0",
          "2026-08-20",
          "Ny webshop",
          items("Hurtigere betaling og fri fragt over 300 kr."),
        ),
      ],
      background_theme: "Lys",
    } as Content.ReleaseNotesSliceDefaultPrimary,
  },
};
