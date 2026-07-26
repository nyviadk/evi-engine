// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Persona: "Kaffemølle Aarhus" (src/lib/preview/persona.ts). Se R4.7.

import type { Content } from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";
import { line, h2, h3 } from "@/src/lib/preview/mockFields";

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser layoutet i previewet).
export const previewWrapperClassName = "block w-full";

type CaseItem = Content.CaseStudiesSliceDefaultPrimaryCasesItem;

// Bygger en TableField (label · værdi) fra par — samme form som editorens
// 2-kolonne-tabel: body.rows[].cells[].content (rich text).
let rowKey = 0;
const metaTable = (pairs: [string, string][]): CaseItem["meta"] =>
  ({
    body: {
      rows: pairs.map(([label, value]) => {
        rowKey += 1;
        return {
          key: `row-${rowKey}`,
          cells: [
            { key: `cell-${rowKey}-0`, type: "data", content: line(label) },
            { key: `cell-${rowKey}-1`, type: "data", content: line(value) },
          ],
        };
      }),
    },
  }) as unknown as CaseItem["meta"];

// Genbrugte, accepterede Unsplash-billeder fra Hero-mock, croppet 4:3.
const img = (id: string): CaseItem["image"] =>
  ({
    id: `mock-${id}`,
    url: `https://images.unsplash.com/photo-${id}?fit=crop&ar=4:3&w=1200`,
    alt: null,
    copyright: null,
    dimensions: { width: 1200, height: 900 },
    edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
  }) as unknown as CaseItem["image"];

export const mock: Record<string, Content.CaseStudiesSlice> = {
  default: {
    id: "mock-case-studies-default",
    slice_type: "case_studies",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Samarbejder vi er stolte af"),
      body: [
        {
          type: "paragraph",
          text: "Fra små caféer til store kontorer — her er et par af de steder, hvor vores kaffe er blevet en fast del af hverdagen.",
          spans: [],
          direction: "ltr",
        },
      ],
      cases: [
        {
          image: img("1529892485617-25f63cd7b1e9"),
          title: h3("Café Sonja — fast husblanding"),
          description: line(
            "Vi udviklede en skræddersyet husblanding til Café Sonja, ristet specifikt til deres espressomaskine og deres gæsters smag. I dag er den deres mest solgte kop.",
          ),
          meta: metaTable([
            ["Kunde", "Café Sonja, Aarhus C"],
            ["Samarbejde", "Skræddersyet husblanding"],
            ["Siden", "2021"],
          ]),
          cta_link: {
            link_type: "Web",
            url: "#",
            text: "Læs hele historien",
          } as unknown as CaseItem["cta_link"],
        },
        {
          image: img("1495474472287-4d71bcdd2085"),
          title: h3("Nordisk Tech — kaffe til kontoret"),
          description: line(
            "Et fast abonnement leverer friskristede bønner til Nordisk Techs 120 medarbejdere hver uge — plus en årlig smagning, så kaffeglæden holdes ved lige.",
          ),
          meta: metaTable([
            ["Kunde", "Nordisk Tech"],
            ["Løsning", "Kontorabonnement"],
            ["Kopper om ugen", "~400"],
          ]),
          // Tomt link → "læs mere" skjules (viser at knappen er valgfri).
          cta_link: { link_type: "Any" } as unknown as CaseItem["cta_link"],
        },
        {
          image: img("1495474472287-4d71bcdd2085"),
          title: h3("Aarhus Festuge — pop-up kaffebar"),
          description: line(
            "Til festugen byggede vi en mobil espressobar midt i byen og serverede over 2.000 kopper på en uge — med baristaer fra vores eget hold.",
          ),
          meta: metaTable([
            ["Kunde", "Aarhus Festuge"],
            ["Opgave", "Pop-up espressobar"],
            ["Kopper serveret", "~2.000 på en uge"],
          ]),
          cta_link: { link_type: "Any" } as unknown as CaseItem["cta_link"],
        },
      ],
      // 3 cases > CASE_VISIBLE → "læs alle"-knappen vises i previewet.
      more_label: "Læs alle",
      heading_align: "Venstre",
      background_theme: "Lys",
    },
  },
};
