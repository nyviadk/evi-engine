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

type Step = Content.PlanioRoadmapSliceDefaultPrimary["steps"][number];

const step = (title: string, body: string, tag: string, current = false): Step => ({
  title: h3(title),
  body: line(body),
  tag: line(tag),
  current,
});

export const mock: Record<string, Content.PlanioRoadmapSlice> = {
  default: {
    id: "mock-planio_roadmap-default",
    slice_type: "planio_roadmap",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Det her er kun begyndelsen"),
      body: line(
        "Energi og refleksion er de første skridt. Her er, hvad vi arbejder hen imod.",
      ),
      steps: [
        step(
          "Energi, PlanioCheck og refleksion",
          "Du planlægger med energien og mærker efter bagefter.",
          "I dag",
          true,
        ),
        step(
          "Energi i flere lag",
          "Fysisk, mental og social energi. En fødselsdag kan give glæde og stadig trætte hovedet.",
          "Senere",
        ),
        step(
          "Hele kalenderen med",
          "Energi og refleksion på aftaler fra Google Kalender.",
          "Senere",
        ),
        step(
          "Dine mønstre bliver synlige",
          "Fx at en travl mandag kan mærkes om onsdagen. Aha-øjeblikke, der giver dig selvindsigt og hjælper dig med at sige fra i tide.",
          "Senere",
        ),
        step(
          "Forslag, der passer til dig",
          "Appen lærer dine mønstre at kende og foreslår, hvad der kan flyttes.",
          "Senere",
        ),
      ],
      background_theme: "Mørk",
    },
  },
};
