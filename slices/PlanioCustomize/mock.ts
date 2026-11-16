// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md). planio_-slices må bruge
// My Planio-indhold (fra forside-designet) i stedet for PERSONA.

import type { Content } from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";
import { h2, h3, line } from "@/src/lib/preview/mockFields";

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "dark", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser layoutet i previewet).
export const previewWrapperClassName = "block w-full";

type Primary = Content.PlanioCustomizeSliceDefaultPrimary;

const preset = (
  name: string,
  primary: `#${string}`,
  background: `#${string}`,
  text: `#${string}`,
): Primary["presets"][number] => ({ name, primary, background, text });

const setting = (
  label: string,
  value: string | null,
  extra: { swatch?: `#${string}`; toggle?: boolean } = {},
): Primary["days_settings"][number] => ({
  label: line(label),
  value: value ? line(value) : [],
  swatch: extra.swatch ?? null,
  toggle: extra.toggle ?? false,
});

export const mock: Record<string, Content.PlanioCustomizeSlice> = {
  default: {
    id: "mock-planio_customize-default",
    slice_type: "planio_customize",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Gør appen til din"),
      body: line(
        "Dine egne farver, din energi og dine dage. Du bestemmer, hvordan My Planio ser ud og fungerer.",
      ),
      background_theme: "Mørk",

      colors_title: h3("Helt dine egne farver"),
      colors_body: line(
        "Vælg frit mellem alle farver til appen, og giv hver begivenhed sin egen. Prøv selv her.",
      ),
      colors_primary: "#8C7BD1",
      colors_background: "#FBF6EE",
      colors_text: "#2E2A3A",
      preview_day: line("Onsdag"),
      preview_left: line("40% tilbage"),
      preview_energy: 40,
      preview_energy_used: 10,
      preview_items: [
        { title: line("Holdmøde"), color: null },
        { title: line("Frokost med Sara"), color: "#F2A65A" },
        { title: line("Gåtur"), color: "#5BB98C" },
      ],
      picker_legend: "Hvilken farve vil du ændre?",
      picker_primary: "Primære",
      picker_background: "Baggrund",
      picker_text: "Tekst",
      picker_area: "Mætning og lysstyrke",
      picker_hue: "Farvetone",
      picker_hex: "Farvekode",
      picker_swap: "Lys / mørk",
      presets_label: line("Eller start fra et tema"),
      presets: [
        preset("My Planio farver", "#00C6B4", "#F9F9F9", "#20272E"),
        preset("Afslappet", "#00C6B4", "#F2F2F2", "#381D4D"),
        preset("Eventyrlysten", "#FD7239", "#FEFFFF", "#381D4D"),
        preset("Blød", "#FAD0C9", "#F2F2F2", "#6F6F6F"),
        preset("Jordisk", "#D7C49F", "#F2F2F2", "#343148"),
        preset("Livlig", "#FFA781", "#F2F2F2", "#3A0205"),
        preset("Vandlig", "#00E1D9", "#F2F2F2", "#5E001F"),
        preset("Hyggelig", "#EFC8B1", "#F2F2F2", "#514644"),
        preset("Varm", "#A3842C", "#F2F2F2", "#575200"),
        preset("My Planio mørk", "#00C6B4", "#20272E", "#F9F9F9"),
        preset("Magisk solnedgang", "#FB0C63", "#430A2A", "#DBD5CF"),
        preset("Gløder", "#C9701F", "#161819", "#FAD6AB"),
        preset("Natte sky", "#ADEFD1", "#00203F", "#ADADAD"),
        preset("Natte", "#BCAB0F", "#101820", "#CCCCCC"),
        preset("Rose", "#CE4A7E", "#1C1C1F", "#ADADAD"),
        preset("Eng", "#379321", "#241F1C", "#E7DAC7"),
        preset("Oceanisk", "#9FAFCA", "#0E387A", "#F2F2F2"),
        preset("Kaffe", "#937047", "#241F1C", "#E7DAC7"),
      ],

      energy_title: h3("Energien, som du tænker den"),
      energy_body: line("Sæt dagens energi hver dag, brug den samme, eller slå den fra."),
      energy_level: 4,
      unit_percent: line("Procent"),
      unit_percent_value: "40%",
      unit_spoons: line("Skeer"),
      unit_spoons_value: "4",
      unit_bolts: line("Lyn"),
      unit_bolts_value: "4",
      unit_number: line("Tal"),
      unit_number_value: "4",

      days_label:
        "Indstillinger for dine dage og uger, fx ugens første dag, datoformat, og hvordan i dag og weekenden fremhæves.",
      days_settings: [
        setting("Ugens første dag", "Mandag"),
        setting("Datoformat", "14/10-2026"),
        setting("Datovælgerens visning", "Aktuel uge"),
        setting("Fremhæv i dag", "Rød cirkel", { swatch: "#FF383C" }),
        setting("Fremhæv weekend", null, { toggle: true }),
        setting("Vis klokkeslæt med kolon", null, { toggle: true }),
        setting("Delopgaver i dagslisten", "Altid foldet ud"),
        setting("Når dagen er tom", "Sovende kat"),
      ],
    },
  },
};
