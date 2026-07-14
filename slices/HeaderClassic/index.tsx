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
    languageUrls,
  } = context;

  const allow_brand_translation = settings?.data?.translate_brand === true;

  return (
    <EviHeaderShell data-variant="classic">
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
          {/* Desktop: inline nav. Plain wrapper bærer synligheden — .evi-nav-list
              sætter selv display, så vi styrer den ikke direkte på listen. */}
          <div className="hidden @3xl/nav:block">
            <NavList items={primary.nav_items} linkResolver={linkResolver} />
          </div>

          {/* Sprogvælger: altid synlig, også på mobil (ved siden af hamburgeren).
              i18n-UX: en sprogskifter må aldrig gemmes i menuen. Desktop viser
              fulde navne; mobil kun sprogkoden (DA/EN) uden pil = mindst mulig. */}
          {languageSelectorEnabled && (
            <>
              <LanguageSelector
                locales={tenant.locales}
                currentLang={lang}
                languageUrls={languageUrls}
                className="hidden shrink-0 @3xl/nav:inline-block"
              />
              <LanguageSelector
                variant="compact"
                locales={tenant.locales}
                currentLang={lang}
                languageUrls={languageUrls}
                className="shrink-0 @3xl/nav:hidden"
              />
            </>
          )}

          {/* Desktop-CTA (komponenten baker hidden @3xl:inline-flex ind) */}
          {isFilled.link(primary.cta_link) && (
            <HeaderCTAButton
              link={primary.cta_link}
              linkResolver={linkResolver}
            />
          )}

          {/* Mobil: slide-in drawer med nav + fuld-bredde CTA i bunden */}
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
                className="mt-auto flex w-full justify-center @3xl/nav:hidden"
              />
            )}
          </MobileNavDrawer>
        </EviStack>
      </EviHeaderInner>
    </EviHeaderShell>
  );
}
