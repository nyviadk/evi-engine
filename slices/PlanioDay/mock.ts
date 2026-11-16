// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md). planio_-slices må bruge
// My Planio-indhold (fra forside-designet) i stedet for PERSONA.

import type { Content, RichTextField } from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";
import { h3, line } from "@/src/lib/preview/mockFields";

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser layoutet i previewet).
export const previewWrapperClassName = "block w-full";

type Primary = Content.PlanioDaySliceDefaultPrimary;

/** Rich text med fed del, fx "**Onsdag** i dag". */
function with_bold(
  type: "heading2" | "paragraph",
  text: string,
  bold: string,
): RichTextField {
  const start = text.indexOf(bold);
  return [
    {
      type,
      text,
      spans: [{ type: "strong", start, end: start + bold.length }],
      direction: "ltr",
    },
  ] as RichTextField;
}

const event = (
  title: string,
  time: string,
  energy: number,
  checked = true,
): Primary["plan_today_items"][number] => ({ title, time, energy, checked });

const chip = (text: string, selected = false): Primary["reflect_drains"][number] => ({
  text: line(text),
  selected,
});

const reminder = (
  title: string,
  schedule: string,
  now = false,
): Primary["remind_items"][number] => ({
  title: line(title),
  schedule: line(schedule),
  now,
});

const FUTURE = line("Fremtidig funktion");

export const mock: Record<string, Content.PlanioDaySlice> = {
  default: {
    id: "mock-planio_day-default",
    slice_type: "planio_day",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      heading: with_bold(
        "heading2",
        "En kalender viser, hvornår du har tid. Ikke om du har overskud.",
        "Ikke om du har overskud.",
      ),
      body: line("Sådan kan en onsdag se ud med My Planio."),

      check_time: "07.15",
      check_title: h3("Dagens energi"),
      check_body: line(
        "Sæt den selv, eller få hjælp af PlanioCheck: tre korte spørgsmål om kroppen, sanserne og hovedet.",
      ),
      check_label:
        "PlanioCheck med tre svar: kroppen er godt tilpas, almindelig aktivitet er fin, og hovedet er lidt spredt. Appen foreslår 50% og svarer: Koncentrationen er kort i dag.",
      check_card_title: line("PlanioCheck"),
      check_answers: [
        { question: line("Kroppen"), answer: line("Godt tilpas") },
        { question: line("Sanserne"), answer: line("Almindelig aktivitet er fin") },
        { question: line("Hovedet"), answer: line("Lidt spredt") },
      ],
      check_result: line("Foreslået 50%"),
      check_energy: 50,
      check_says: line("Koncentrationen er kort i dag."),

      plan_time: "07.30",
      plan_title: h3("Planlæg dagen"),
      plan_body: line(
        "Noget tager energi, andet giver. Prøv selv i et forenklet eksempel: Hvad sker der, hvis papirarbejdet også skal med?",
      ),
      plan_start: 50,
      plan_energy_label: line("Dagens energi"),
      plan_planned_label: line("Planlagt"),
      plan_left_label: line("Tilbage"),
      plan_status_start: "Du starter dagen på {procent}.",
      plan_status_balance: "Din energi er i balance på {procent}.",
      plan_status_over: "Du står på {procent}, mere end du havde regnet med i dag.",
      plan_status_zero: "Din dag går præcis op.",
      plan_status_short: "Du mangler {procent} for at være i balance.",
      plan_today_label: with_bold("paragraph", "Onsdag i dag", "Onsdag"),
      plan_today_items: [
        event("Morgenrutine", "07.30–08.15", -10),
        event("Holdmøde", "09.30–10.30", -20),
        event("Pause uden skærm", "10.30–11.00", 10),
        event("Frokost med Sara", "12.00–13.00", -10),
        event("Papirarbejde", "13.30–14.30", -20, false),
        event("Gåtur", "15.00–16.30", 20),
        event("Læs i sofaen", "20.00–21.00", 10, false),
      ],
      plan_tomorrow_label: with_bold(
        "paragraph",
        "Torsdag tæller i morgen, ikke i dag",
        "Torsdag",
      ),
      plan_tomorrow_items: [event("Fødselsdag hos mor", "18.00–21.00", -40)],
      plan_note_badge: FUTURE,
      plan_note: line("Fødselsdag hos mor i morgen. Vil du gemme lidt energi til den?"),

      dialog_time: "09.15",
      dialog_title: h3("Før holdmødet"),
      dialog_body: line(
        "Med et dialogkort vil du kunne vise holdet, hvad der hjælper dig i dag, uden at forklare det hele.",
      ),
      dialog_label:
        "Fremtidig funktion: et dialogkort, der er delt med holdet. Fra PlanioCheck: Koncentrationen er kort i dag. Det hjælper mig: Skriv beslutninger ned, Én ting ad gangen og En pause undervejs.",
      dialog_badge: FUTURE,
      dialog_card_title: line("Mit dialogkort"),
      dialog_card_note: line("Delt med holdet"),
      dialog_source_label: line("Fra PlanioCheck"),
      dialog_source_text: line("Koncentrationen er kort i dag."),
      dialog_helps_label: line("Det hjælper mig"),
      dialog_helps: [
        { text: line("Skriv beslutninger ned") },
        { text: line("Én ting ad gangen") },
        { text: line("En pause undervejs") },
      ],

      reflect_time: "10.45",
      reflect_title: h3("Hvordan gik det?"),
      reflect_body: line(
        "Når du krydser af, kan du sætte ord på, hvad der tog på kræfterne, og hvad der gjorde godt.",
      ),
      reflect_label:
        "Refleksion efter Holdmøde. Under Tog på kræfterne er Fyldt eller uklart hoved valgt, og under Gjorde godt er Rolig og tilpas valgt. Appen svarer: Forslag: tager mere energi. Fremtidig funktion: en note, hvor der står: Holdet tog over, da jeg mistede tråden.",
      reflect_card_label: line("Holdmøde · planlagt -20%"),
      reflect_question: line("Hvordan havde du det bagefter?"),
      reflect_drains_label: line("Tog på kræfterne"),
      reflect_drains: [
        chip("Tung eller træt krop"),
        chip("Fyldt eller uklart hoved", true),
        chip("For mange indtryk"),
      ],
      reflect_gives_label: line("Gjorde godt"),
      reflect_gives: [chip("Rolig og tilpas", true), chip("Glad og motiveret")],
      reflect_result: line("Forslag: tager mere energi"),
      reflect_note_badge: FUTURE,
      reflect_note: line("Holdet tog over, da jeg mistede tråden."),

      remind_time: "14.20",
      remind_title: h3("Check-in: Krop"),
      remind_body: line(
        "Faste påmindelser er til alt det, der ikke skal fylde i kalenderen. Hver dag, hver lørdag, hver anden måned, eller lige som du vil.",
      ),
      remind_label:
        "Fire faste påmindelser: Vitaminpiller hver dag, Tjek postkassen hver lørdag, Check-in: Krop på et tilfældigt tidspunkt, som kommer nu, og Skift tandbørstehoved hver anden måned.",
      remind_card_title: line("Faste påmindelser"),
      remind_items: [
        reminder("Vitaminpiller", "Hver dag · 08.00"),
        reminder("Tjek postkassen", "Hver uge om lørdag · 10.00"),
        reminder("Check-in: Krop", "Tilfældig tid mellem 10.00 og 18.00", true),
        reminder("Skift tandbørstehoved", "Hver 2. måned, den 14. · 21.00"),
      ],
      remind_now_label: line("nu"),
    },
  },
};
