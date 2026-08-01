// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Persona: "Kaffemølle Aarhus" (src/lib/preview/persona.ts). Se R4.7.

import type { Content } from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";
import { line, paras, h2, h3, h4 } from "@/src/lib/preview/mockFields";

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser splittet i previewet).
export const previewWrapperClassName = "block w-full";

export const mock: Record<string, Content.TextContentSlice> = {
  default: {
    id: "mock-text-content-default",
    slice_type: "text_content",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Fra bønne til kop"),
      body: line(
        "Vi tror på gennemsigtighed i hvert led — her er hvordan vi arbejder, og hvad du kan forvente.",
      ),
      heading_align: "Centreret",
      left_heading: h3("Vores tilgang"),
      left_body: paras(
        "Vi køber direkte fra farmerne og betaler over markedspris for de bedste høster. Det giver bedre kaffe i koppen — og en mere fair handel for dem, der dyrker den.",
        "Alt bliver ristet i små portioner på vores eget værksted i Aarhus, aldrig mere end en uge før det når dig. Vi rister efter bønnens egen profil frem for én fast opskrift.",
        "Når kaffen er klar, pakker og sender vi inden for 48 timer, så friskheden følger hele vejen hjem til din kværn.",
      ),
      box_title: h4("Godt at vide"),
      box_body: paras(
        "Alle vores bønner er sporbare til den enkelte farm — scan QR-koden på posen og se præcis, hvor din kaffe kommer fra, og hvem der har dyrket den.",
        "Er du ny i specialkaffe, følger der en lille bryggeguide med i hver pose.",
      ),
      box_color: "Neutral",
      right_heading: h3("Hvad du kan forvente"),
      right_body: paras(
        "Friskristet kaffe med en smagsprofil, der matcher din smag — fra lyse, frugtige ristninger til mørke og fyldige.",
        "Er du i tvivl, hjælper vi dig gerne med at finde den rette ristning og bryggemetode til lige netop dit udstyr.",
        "Med et abonnement får du automatisk nye bønner, når du er ved at løbe tør — sæt på pause eller opsig når som helst.",
      ),
      background_theme: "Lys",
    },
  },
};
