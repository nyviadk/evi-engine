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

type BoxColor = "Neutral" | "Primær" | "Sekundær";

const review = (
  title: string,
  body: string,
  attribution: string,
  box_color: BoxColor,
) => ({
  title: h3(title),
  body: line(body),
  attribution: line(attribution),
  box_color,
});

// Carousel-udtalelse: citat + afsender (navn) + kontekst (fx forløb).
const quote = (body: string, attribution: string, context: string) => ({
  body: line(body),
  attribution: line(attribution),
  title: line(context),
});

export const mock: Record<string, Content.TestimonialsSlice> = {
  default: {
    id: "mock-testimonials-default",
    slice_type: "testimonials",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    primary: {
      heading: h2("Hvad vores kunder siger"),
      body: line(
        "Ærlige ord fra folk der lægger vejen forbi risteriet — og bliver hængende.",
      ),
      testimonials: [
        review(
          "Bedste kop i Aarhus",
          "Jeg troede ikke der var forskel på kaffe, før jeg smagte deres filterkaffe. Nu kører jeg gerne på tværs af byen for en pose friskristede bønner.",
          "— Mette, par midt 30'erne",
          "Neutral",
        ),
        review(
          "Som at rejse med bønnen",
          "Personalet tog sig tid til at forklare hele rejsen bag bønnen — fra farmen til tromlen. Man kan smage at de brænder for det. Min lørdag starter aldrig andre steder end her, med en flat white og en snak hen over disken.",
          "— Jonas, fast gæst siden 2019",
          "Primær",
        ),
        review(
          "Ærligt og ligetil",
          "God kaffe, ærlige folk, fair priser.",
          "— Anders, pensionist",
          "Sekundær",
        ),
        review(
          "Abonnementet er guld værd",
          "Vi får bønner til døren hver 14. dag, altid friskristet. Kaffen er aldrig ældre end en uge, når den lander i kværnen derhjemme.",
          "— Sofie & Lars, børnefamilie",
          "Neutral",
        ),
        review(
          "Perfekt til mødet",
          "Bestilte catering til kontoret — alle spurgte bagefter, hvor kaffen var fra.",
          "— Camilla, kontorleder",
          "Primær",
        ),
        review(
          "Kurset ændrede min morgen",
          "Jeg tog deres brygkursus en søndag og forstår nu, hvorfor min kaffe derhjemme aldrig smagte rigtigt. Simple råd, kæmpe forskel — og de skænkede rundhåndet undervejs.",
          "— Rasmus, hjemmebrygger",
          "Sekundær",
        ),
      ],
      heading_align: "Centreret",
      background_theme: "Lys",
      more_label: "Læs flere",
    } as Content.TestimonialsSliceDefaultPrimary,
  },
  carousel: {
    id: "mock-testimonials-carousel",
    slice_type: "testimonials",
    slice_label: null,
    variation: "carousel",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Ord fra vores gæster"),
      body: line("Rigtige mennesker, rigtig kaffe — her er nogle af dem."),
      heading_align: "Centreret",
      quote_icon: "quote",
      testimonials: [
        quote(
          "Bedste kaffe jeg har fået — punktum.",
          "Anders",
          "Pensionist",
        ),
        quote(
          "Jeg troede ikke, der var forskel på kaffe, før jeg smagte deres lyse ristning. Nu kører jeg gerne på tværs af byen for en frisk pose — og personalet husker altid min bestilling.",
          "Mette",
          "Fast gæst siden 2019",
        ),
        quote(
          "Abonnementet er guld værd — friske bønner til døren hver 14. dag.",
          "Sofie & Lars",
          "Børnefamilie",
        ),
        quote("Ærlige folk, fair priser, fantastisk kaffe.", "Jonas", "Abonnent"),
        quote(
          "Deres brygkursus ændrede min morgenrutine fuldstændig.",
          "Rasmus",
          "Hjemmebrygger",
        ),
      ],
      arrow_icon: "",
      prev_label: "Forrige",
      next_label: "Næste",
      background_theme: "Lys",
    } as unknown as Content.TestimonialsSliceCarouselPrimary,
  },
};
