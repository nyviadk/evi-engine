// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content, ImageField, LinkField } from "@prismicio/client";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";
import { h3 } from "@/src/lib/preview/mockFields";

export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

// Fuld-bredde sektion → block w-full (ellers kollapser layoutet i previewet).
export const previewWrapperClassName = "block w-full";

const NO_LINK: LinkField = { link_type: "Any" };
// Uden tekst som i Prismic (webLink() sætter tekst og skjulte, at logoerne
// ikke blev links).
const WEB_LINK: LinkField = { link_type: "Web", url: "#" };

// Fiktive, selvtegnede logoer i public/preview/logos/ (ingen licens- eller
// varemærkespørgsmål). Preview-routen gør "/…"-stierne absolutte.
const logo = (name: string, file: string, width: number, linked = false) => {
  const image: ImageField = {
    id: `mock-logo-${file}`,
    url: `/preview/logos/${file}.svg`,
    alt: null,
    copyright: null,
    dimensions: { width, height: 40 },
    edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
  };
  return { logo: image, name, link: linked ? WEB_LINK : NO_LINK };
};

const BONNEHUSET = logo("Bønnehuset", "bonnehuset", 168, true);
const MAELKEBAREN = logo("Mælkebaren", "maelkebaren", 172, true);
const KVAERNVAERKET = logo("Kværnværket", "kvaernvaerket", 196);
const RISTELAUGET = logo("Ristelauget", "ristelauget", 164, true);
const KOPKOMPAGNIET = logo("Kopkompagniet", "kopkompagniet", 190);
const BRYGGEBLADET = logo("Bryggebladet", "bryggebladet", 160);
const SORT_STAERK = logo("Sort & Stærk", "sort-staerk", 168);

export const mock: Record<string, Content.LogosSlice> = {
  default: {
    id: "mock-logos-default",
    slice_type: "logos",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    primary: {
      heading: [],
      body: [],
      heading_align: "Centreret",
      logos: [
        BONNEHUSET,
        MAELKEBAREN,
        KVAERNVAERKET,
        RISTELAUGET,
        KOPKOMPAGNIET,
      ],
      background_theme: "Lys",
    } as Content.LogosSliceDefaultPrimary,
  },
  grouped: {
    id: "mock-logos-grouped",
    slice_type: "logos",
    slice_label: null,
    variation: "grouped",
    version: "scaffold",
    items: [],
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    primary: {
      heading: [],
      body: [],
      heading_align: "Centreret",
      group_1_title: h3("Leverandører"),
      group_1_logos: [BONNEHUSET, MAELKEBAREN, KVAERNVAERKET],
      group_2_title: h3("Samarbejdspartnere"),
      group_2_logos: [RISTELAUGET, KOPKOMPAGNIET],
      group_3_title: h3("Kendt fra"),
      group_3_logos: [BRYGGEBLADET, SORT_STAERK],
      background_theme: "Lys",
    } as Content.LogosSliceGroupedPrimary,
  },
};
