// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content, ImageField } from "@prismicio/client";
import { h2, line } from "@/src/lib/preview/mockFields";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

type Primary = Content.CallToActionSliceDefaultPrimary;

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "dark", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser layoutet i previewet).
export const previewWrapperClassName = "block w-full";

// Selvtegnet, fiktivt app-ikon i public/preview/ (ingen licens- eller
// varemærkespørgsmål). Preview-routen gør "/…"-stien absolut.
const ICON: ImageField = {
  id: "mock-kaffemolle-icon",
  url: "/preview/kaffemolle-icon.svg",
  alt: null,
  copyright: null,
  dimensions: { width: 128, height: 128 },
  edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
};

// Rigtige butiks-domæner, så knapperne bliver butiksknapper; app-id'erne er fiktive.
const store_link = (url: string, text: string): Primary["cta_link"] => ({
  link_type: "Web",
  url,
  text,
});

export const mock: Record<string, Content.CallToActionSlice> = {
  default: {
    id: "mock-call_to_action-default",
    slice_type: "call_to_action",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Din kaffe er klar, når du kommer"),
      body: line("Bestil i appen, og hent den ved disken uden at stå i kø."),
      cta_link: store_link(
        "https://apps.apple.com/dk/app/kaffemolle/id0000000000",
        "Hent i App Store",
      ),
      cta_link_secondary: store_link(
        "https://play.google.com/store/apps/details?id=example.kaffemolle",
        "Hent på Google Play",
      ),
      image: ICON,
      background_theme: "Mørk",
    },
  },
};
