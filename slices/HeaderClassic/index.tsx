import type { Content } from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { BrandLink } from "@/src/components/header/parts/BrandLink";
import { NavList } from "@/src/components/header/parts/NavList";
import { HeaderCTAButton } from "@/src/components/header/parts/HeaderCTAButton";
import { LanguageSelector } from "@/src/components/header/parts/LanguageSelector";
import { MobileDisclosure } from "@/src/components/header/parts/MobileDisclosure";
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
 *  - MobileDisclosure → hamburger + panel on narrow container
 *  - NavList          → menu links (via Prismic)
 *  - LanguageSelector → optional <select> dropdown
 *  - HeaderCTAButton  → optional EviButton (asChild PrismicNextLink)
 *
 * No raw Tailwind classes, no free JSX. Always solid, never sticky —
 * variant-specific choices are hardcoded in the composition, not exposed
 * as slice fields.
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

        <EviStack as="nav" direction="row" align="center" gap="sm" aria-label="Hovedmenu">
          <MobileDisclosure>
            <NavList items={primary.nav_items} linkResolver={linkResolver} />
          </MobileDisclosure>

          {languageSelectorEnabled && (
            <LanguageSelector
              locales={tenant.locales}
              currentLang={lang}
              languageUrls={languageUrls}
              className="hidden @3xl/nav:inline-block"
            />
          )}

          {isFilled.link(primary.cta_link) && (
            <HeaderCTAButton link={primary.cta_link} linkResolver={linkResolver} />
          )}
        </EviStack>
      </EviHeaderInner>
    </EviHeaderShell>
  );
}
