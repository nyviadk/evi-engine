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

export const mock: Record<string, Content.HeaderClassicSlice> = {
  default: {
    id: "mock-header-classic-default",
    slice_type: "header_classic",
    slice_label: null,
    variation: "default",
    version: "sktwi1xtmkfgx8626",
    items: [],
    primary: {
      // Tom logo → BrandLink falder tilbage til site_name (via settings.data.site_name).
      // settings er null i preview → BrandLink falder yderligere tilbage til hostname.
      // hostname er PERSONA.domain → "kaffemolle.example" vises som brand-tekst.
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      logo: {} as Content.HeaderClassicSliceDefaultPrimary["logo"],
      nav_items: PERSONA.nav.top.map((label, i) => ({
        link_type: "Web" as const,
        url: "#",
        key: String(i + 1),
        text: label,
      })) as Content.HeaderClassicSliceDefaultPrimary["nav_items"],
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      cta_link: {
        link_type: "Web" as const,
        url: "#",
        text: "Book bord",
      } as Content.HeaderClassicSliceDefaultPrimary["cta_link"],
    },
  },
};
