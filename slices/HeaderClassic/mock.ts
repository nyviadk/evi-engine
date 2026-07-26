// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content } from "@prismicio/client";
import { PERSONA } from "@/src/lib/preview/persona";
import type { EviHeaderSliceContext } from "@/src/components/header/types";
import type { EviContext } from "@/src/lib/prismic/context";

// HeaderClassic slice læser en dyb context (tenant, settings, hostname osv.)
// Preview kan slippe med minimal shape — languageSelectorEnabled: false gør
// at tenant.locales/default_locale/force_lang_prefix aldrig læses. Cast'et
// bypasser strict shape-check for felter slice-koden ikke faktisk rører.
const previewTenant = {
  repo: "preview",
  locales: ["da-dk"],
  default_locale: "da-dk",
  force_lang_prefix: false,
  redirects: {},
  prismic_token: "",
  prismic_write_api_token: "",
} as unknown as EviContext["tenant"];

// HeaderClassic bruger max-w-evi mx-auto internt (via EviHeaderInner) — hvis
// preview-wrapper er inline-block kan max-w ikke udvide sig. block w-full
// giver header'en fuld viewport-bredde, som er hvordan editor ser den.
export const previewWrapperClassName = "block w-full";

export const context: EviHeaderSliceContext = {
  linkResolver: () => "/",
  settings: null,
  tenant: previewTenant,
  lang: "da-dk",
  hostname: PERSONA.domain,
  homeHref: "/",
  currentPathname: "/",
  languageSelectorEnabled: false,
  languageUrls: {},
};

// Et menupunkt: url = "#" → rigtigt link; url = null → rent tekst-top (fx
// "Shop" hvor der ikke findes en samleside). Første link i en gruppe = det
// synlige punkt, resten = dropdown.
let navKey = 0;
const link = (text: string, url: string | null) => {
  navKey += 1;
  const key = String(navKey);
  return url === null
    ? { link_type: "Any" as const, key, text }
    : { link_type: "Web" as const, url, key, text };
};

export const mock: Record<string, Content.HeaderClassicSlice> = {
  default: {
    id: "mock-header-classic-default",
    slice_type: "header_classic",
    slice_label: null,
    variation: "default",
    version: "sktwi1xtmkfgx8626",
    items: [],
    primary: {
      // Tom logo → BrandLink falder tilbage til site_name (settings null i
      // preview → videre til hostname = PERSONA.domain som brand-tekst).
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      logo: {} as Content.HeaderClassicSliceDefaultPrimary["logo"],
      nav_groups: [
        {
          links: [
            link("Kaffe", "#"),
            link("Kaffedrikke", "#"),
            link("Espressobar", "#"),
            link("Filterkaffe", "#"),
          ],
        },
        {
          links: [
            link("Shop", null),
            link("Brygudstyr", "#"),
            link("Gavekort", "#"),
            link("Abonnement", "#"),
            link("Kurser", "#"),
          ],
        },
        {
          links: [
            link("Om os", "#"),
            link("Vores historie", "#"),
            link("Kaffefarmerne", "#"),
            link("Bæredygtighed", "#"),
          ],
        },
        { links: [link("Blog", "#")] },
        { links: [link("Kontakt", "#")] },
      ] as Content.HeaderClassicSliceDefaultPrimary["nav_groups"],
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      cta_link: {
        link_type: "Web" as const,
        url: "#",
        text: "Book bord",
      } as Content.HeaderClassicSliceDefaultPrimary["cta_link"],
    },
  },
};
