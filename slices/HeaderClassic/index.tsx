import type { Content } from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { BrandLink } from "@/src/components/header/parts/BrandLink";
import { NavList } from "@/src/components/header/parts/NavList";
import { HeaderCTAButton } from "@/src/components/header/parts/HeaderCTAButton";
import { LanguageSelector } from "@/src/components/header/parts/LanguageSelector";
import { MobileDisclosure } from "@/src/components/header/parts/MobileDisclosure";
import type { EviHeaderSliceContext } from "@/src/components/header/types";

/**
 * Classic header layout: brand on the left, nav + optional CTA on the right.
 * Mobile collapses to hamburger below the @3xl/nav container-query breakpoint.
 * Always solid background, never sticky — deliberate design constraint of this
 * variant. If a tenant wants sticky or transparent behavior, that will be a
 * separate variant (e.g. `HeaderSticky`, `HeaderTransparentHero`).
 *
 * Field-driven behavior (from Prismic slice):
 *  - `logo` — if filled, renders as image; otherwise falls back to site_name text
 *  - `nav_items` — repeatable link list
 *  - `cta_link` — if filled, renders a CTA button after the nav (desktop only)
 *
 * Static, slice-agnostic behavior (from navigation doc, via context):
 *  - `languageSelectorEnabled` — renders <LanguageSelector> if tenant has 2+ locales
 *
 * Context (from SliceZone) provides: linkResolver, settings, tenant, lang,
 * hostname, homeHref, currentPathname, languageSelectorEnabled, languageUrls.
 */
export default function HeaderClassic({
  slice,
  context,
}: SliceComponentProps<
  Content.HeaderClassicSlice,
  EviHeaderSliceContext
>): React.ReactElement {
  const { primary } = slice;
  const {
    linkResolver,
    settings,
    tenant,
    lang,
    hostname,
    homeHref,
    languageSelectorEnabled,
    languageUrls,
  } = context;

  const allow_brand_translation = settings?.data?.translate_brand === true;

  return (
    <header
      data-slot="evi-header"
      data-variant="classic"
      className="evi-nav theme-light @container/nav relative border-b border-current/10"
    >
      <div className="mx-auto flex max-w-evi items-center justify-between gap-4 px-4 py-3">
        <BrandLink
          logo={primary.logo}
          siteName={settings?.data?.site_name}
          hostname={hostname}
          homeHref={homeHref}
          allowTranslation={allow_brand_translation}
        />

        <nav aria-label="Hovedmenu" className="flex items-center gap-3">
          <MobileDisclosure>
            <NavList items={primary.nav_items} linkResolver={linkResolver} />
          </MobileDisclosure>

          {languageSelectorEnabled && (
            <LanguageSelector
              locales={tenant.locales}
              currentLang={lang}
              languageUrls={languageUrls}
              className="@3xl/nav:inline-block hidden"
            />
          )}

          {isFilled.link(primary.cta_link) && (
            <HeaderCTAButton
              link={primary.cta_link}
              linkResolver={linkResolver}
              className="@3xl/nav:inline-flex hidden"
            />
          )}
        </nav>
      </div>
    </header>
  );
}
