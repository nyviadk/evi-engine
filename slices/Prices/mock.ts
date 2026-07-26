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

type PlanItem = Content.PricesSliceDefaultPrimaryPlansItem;

// list-only rich text (kun list-item-blokke) → én "inkluderet"-liste pr. kort.
const bullets = (items: string[]): PlanItem["included"] =>
  items.map((text) => ({
    type: "list-item",
    text,
    spans: [],
    direction: "ltr",
  })) as unknown as PlanItem["included"];

const cta = (text: string): PlanItem["cta_link"] =>
  ({ link_type: "Web", url: "#", text }) as unknown as PlanItem["cta_link"];

const empty_icon = "" as PlanItem["included_icon"];

export const mock: Record<string, Content.PricesSlice> = {
  default: {
    id: "mock-prices-default",
    slice_type: "prices",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Vælg den kaffe der passer til jer"),
      body: line(
        "Fra en enkelt smagskasse til fast kaffe på kontoret — samme friskristede bønner, uanset hvad du vælger.",
      ),
      plans: [
        {
          title: h3("Smagskassen"),
          price: line("99 kr."),
          caption: line("pr. levering · hver 4. uge"),
          body: line(
            "Perfekt til dig der vil opdage nye kaffer uden at binde dig.",
          ),
          included: bullets([
            "250 g friskristet kaffe",
            "Skiftende oprindelse hver gang",
            "Fri levering til døren",
          ]),
          included_icon: empty_icon,
          cta_link: cta("Kom i gang"),
        },
        {
          title: h3("Hjemmeabonnement"),
          price: line("249 kr."),
          caption: line("pr. måned · 2 poser"),
          body: line(
            "Vores mest populære — friskristet kaffe, leveret så du aldrig løber tør.",
          ),
          included: bullets([
            "2 × 250 g hver måned",
            "Vælg lys eller mørk ristning",
            "Fri levering",
            "Sæt på pause når som helst",
          ]),
          // Ikon-override: uden prefix = lucide (circle-check her, check ellers).
          included_icon: "circle-check" as PlanItem["included_icon"],
          cta_link: cta("Vælg abonnement"),
        },
        {
          title: h3("Kontorkaffe"),
          price: line("Fra 899 kr."),
          caption: line("pr. måned · fra 5 kg"),
          body: line(
            "Til arbejdspladsen: friske bønner, udstyr og en fast kaffeansvarlig.",
          ),
          included: bullets([
            "Friskristede bønner ugentligt",
            "Gratis udlånsmaskine",
            "Fast kaffeansvarlig",
            "Månedlig smagning på kontoret",
          ]),
          included_icon: empty_icon,
          cta_link: cta("Kontakt os"),
        },
      ],
      card_color: "Neutral",
      heading_align: "Centreret",
      background_theme: "Lys",
    },
  },
};
