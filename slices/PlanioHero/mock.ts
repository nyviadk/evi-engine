// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md). planio_-slices må bruge
// My Planio-indhold (fra forside-designet) i stedet for PERSONA.

import type { Content } from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";
import { line } from "@/src/lib/preview/mockFields";

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: true, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser layoutet i previewet).
export const previewWrapperClassName = "block w-full";

// Rigtige butiks-URL'er: knapperne genkender butikken på domænet.
type StoreLink = Content.PlanioHeroSliceDefaultPrimary["cta_link"];
const APP_STORE: StoreLink = {
  link_type: "Web",
  url: "https://apps.apple.com/dk/app/min-planio/id6744327407",
  text: "Hent i App Store",
};
const GOOGLE_PLAY: StoreLink = {
  link_type: "Web",
  url: "https://play.google.com/store/apps/details?id=com.planio",
  text: "Hent på Google Play",
};

const item = (
  time: string,
  title: string,
  change: string,
  done = false,
): Content.PlanioHeroSliceDefaultPrimaryPlanItemsItem => ({
  time,
  title: line(title),
  change,
  done,
});

export const mock: Record<string, Content.PlanioHeroSlice> = {
  default: {
    id: "mock-planio_hero-default",
    slice_type: "planio_hero",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      heading: [
        {
          type: "heading1",
          text: "Planlæg dine dage efter den energi, du faktisk har.",
          spans: [],
          direction: "ltr",
        },
      ],
      body: line("En kalender til voksne med ADHD og autisme."),
      cta_link: APP_STORE,
      cta_link_secondary: GOOGLE_PLAY,
      note: line("Gratis · Ingen reklamer · Dansk og engelsk"),
      plan_label: "Onsdagens plan i appen med 40% energi tilbage",
      plan_initials: "OT",
      plan_day: line("Onsdag"),
      plan_date: line("14. oktober · Uge 42"),
      plan_energy: line("40% tilbage"),
      plan_energy_left: 4,
      plan_energy_used: 1,
      plan_items: [
        item("07.30", "Morgenrutine", "", true),
        item("09.30", "Holdmøde", "-20%"),
        item("10.30", "Pause uden skærm", "+10%"),
        item("12.00", "Frokost med Sara", "-10%"),
        item("15.00", "Gåtur", "+20%"),
      ],
    },
  },
};
