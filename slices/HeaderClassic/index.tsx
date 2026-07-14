import type { Content } from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { BrandLink } from "@/src/components/header/parts/BrandLink";
import { NavList } from "@/src/components/header/parts/NavList";
import { HeaderCTAButton } from "@/src/components/header/parts/HeaderCTAButton";
import { LanguageSelector } from "@/src/components/header/parts/LanguageSelector";
import { MobileNavDrawer } from "@/src/components/header/parts/MobileNavDrawer";
import { EviHeaderInner } from "@/src/components/chrome/EviHeaderInner";
import { EviHeaderShell } from "@/src/components/chrome/EviHeaderShell";
import { EviStack } from "@/src/components/layout/EviStack";
import type { EviHeaderSliceContext } from "@/src/components/header/types";

// navigation.mobile_nav_breakpoint (Prismic-label) → container-bredde hvor
// nav'en folder fra hamburger til inline række. Værdien injiceres server-side
// i en container-query af EviHeaderShell. Ukendt/tom → 48rem (Standard).
const NAV_BREAKPOINT: Record<string, string> = {
  Kompakt: "40rem", // 640px  (Tailwind sm)
  Standard: "48rem", // 768px  (md)
  Bred: "64rem", // 1024px (lg)
  "Meget bred": "80rem", // 1280px (xl)
  "Ekstra bred": "96rem", // 1536px (2xl) — meget link-tunge navs
};

/**
 * Classic header layout — pure Evi component composition.
 *
 * Composition:
 *  - EviHeaderShell   → semantic <header> + theme + container-query context
 *  - EviHeaderInner   → max-w + row + align+justify + padding
 *  - BrandLink        → logo image or brand-text fallback
 *  - EviStack row     → actions container (nav + language + CTA)
 *  - MobileNavDrawer  → hamburger + slide-in drawer on narrow container
 *  - NavList          → menu links (via Prismic)
 *  - LanguageSelector → optional <select> dropdown, ALWAYS visible (også mobil)
 *  - HeaderCTAButton  → optional EviButton (asChild PrismicNextLink)
 *
 * Nav renderes to steder: inline på desktop, i draweren på mobil (kun én
 * synlig ad gangen). Bortset fra responsiv synlighed er alt Evi-komposition.
 * Always solid, never sticky — variant-specifikke valg er hardcodet i
 * kompositionen, ikke eksponeret som slice-felter.
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
    mobileNavBreakpoint,
    languageUrls,
  } = context;

  const allow_brand_translation = settings?.data?.translate_brand === true;
  const navBreakpoint = NAV_BREAKPOINT[mobileNavBreakpoint ?? ""] ?? "48rem";

  return (
    <EviHeaderShell data-variant="classic" navBreakpoint={navBreakpoint}>
      <EviHeaderInner>
        <BrandLink
          logo={primary.logo}
          siteName={settings?.data?.site_name}
          hostname={hostname}
          homeHref={homeHref}
          allowTranslation={allow_brand_translation}
        />

        <EviStack
          as="nav"
          direction="row"
          align="center"
          gap="sm"
          aria-label="Hovedmenu"
        >
          {/* Desktop-cluster: inline nav + fuldt sprog + CTA. Synligheden styres
              af .evi-nav-desktop (EviHeaderShells injicerede container-query), så
              vi sætter INGEN breakpoint-klasser på børnene. */}
          <div className="evi-nav-desktop">
            <NavList items={primary.nav_items} linkResolver={linkResolver} />
            {languageSelectorEnabled && (
              <LanguageSelector
                locales={tenant.locales}
                currentLang={lang}
                languageUrls={languageUrls}
                className="shrink-0"
              />
            )}
            {isFilled.link(primary.cta_link) && (
              <HeaderCTAButton
                link={primary.cta_link}
                linkResolver={linkResolver}
              />
            )}
          </div>

          {/* Mobil-cluster: kompakt sprogkode (DA/EN) + hamburger-drawer.
              i18n-UX: sprogvælgeren er synlig, ikke gemt i menuen. */}
          <div className="evi-nav-mobile">
            {languageSelectorEnabled && (
              <LanguageSelector
                variant="compact"
                locales={tenant.locales}
                currentLang={lang}
                languageUrls={languageUrls}
                className="shrink-0"
              />
            )}
            <MobileNavDrawer>
              <NavList
                items={primary.nav_items}
                linkResolver={linkResolver}
                itemClassName="py-3 text-lg"
              />
              {isFilled.link(primary.cta_link) && (
                <HeaderCTAButton
                  link={primary.cta_link}
                  linkResolver={linkResolver}
                  className="mt-auto flex w-full justify-center"
                />
              )}
            </MobileNavDrawer>
          </div>
        </EviStack>
      </EviHeaderInner>
    </EviHeaderShell>
  );
}
