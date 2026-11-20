// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content, ImageField, LinkToMediaField } from "@prismicio/client";
import { h2, line, paras } from "@/src/lib/preview/mockFields";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

type Primary = Content.VideoSliceDefaultPrimary;

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  lang: "da-dk",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser layoutet i previewet).
export const previewWrapperClassName = "block w-full";

// Selvtegnede, fiktive filer i public/preview/ (ingen licensspørgsmål).
const media = (name: string): LinkToMediaField<"filled"> => ({
  link_type: "Media",
  id: `mock-${name}`,
  kind: "file",
  name: `${name}.mp4`,
  url: `/preview/${name}.mp4`,
  size: "16000",
});

const poster = (name: string, width: number, height: number): ImageField => ({
  id: `mock-${name}`,
  url: `/preview/${name}.jpg`,
  alt: null,
  copyright: null,
  dimensions: { width, height },
  edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
});

export const mock: Record<string, Content.VideoSlice> = {
  default: {
    id: "mock-video-default",
    slice_type: "video",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      heading: h2("Se, hvordan du bestiller på 30 sekunder"),
      body: line("Fra appen til disken, uden at stå i kø."),
      video: media("kaffemolle-video-wide") as Primary["video"],
      video_mobile: media("kaffemolle-video-tall") as Primary["video_mobile"],
      poster: poster("kaffemolle-video-wide", 1280, 720),
      poster_mobile: poster("kaffemolle-video-tall", 720, 1280),
      transcript: paras(
        "Bestil i appen.",
        "Hent ved disken.",
        "Kaffemølle Aarhus.",
      ),
      background_theme: "Lys",
    },
  },
};
