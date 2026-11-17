import type { LinkField } from "@prismicio/client";

import { EviHeaderInner } from "@/src/components/chrome/EviHeaderInner";
import { EviHeaderShell } from "@/src/components/chrome/EviHeaderShell";
import { EviStack } from "@/src/components/layout/EviStack";
import { HeaderCTAButton } from "@/src/components/header/parts/HeaderCTAButton";
import { LanguageSelector } from "@/src/components/header/parts/LanguageSelector";
import { MobileNavDrawer } from "@/src/components/header/parts/MobileNavDrawer";
import {
  resolve_nav_groups,
  type NavGroupItem,
} from "@/src/components/header/parts/navGroups";
import { NavGroupsDesktop } from "@/src/components/header/parts/NavGroupsDesktop";
import { NavGroupsMobile } from "@/src/components/header/parts/NavGroupsMobile";
import type { EviHeaderSliceContext } from "@/src/components/header/types";
import { is_link_filled } from "@/src/lib/prismic/links";

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

export type HeaderClassicLayoutProps = {
  /** Venstre zone: brandet, fx BrandLink. */
  brand: React.ReactNode;
  /** Felterne, alle classic-headere har. */
  primary: { cta_link: LinkField; nav_groups: readonly NavGroupItem[] };
  context: EviHeaderSliceContext;
  /** Headerens tema. @default "light" */
  theme?: string;
  /** Til selve `<header>`, fx sticky. */
  className?: string;
};

/**
 * Classic header layout — pure Evi component composition.
 *
 * Composition:
 *  - EviHeaderShell   → semantic <header> + theme + container-query context
 *  - EviHeaderInner   → max-w + row + align+justify + padding
 *  - brand            → slot, fx BrandLink (logo eller sitenavn)
 *  - EviStack row     → actions container (nav + language + CTA)
 *  - MobileNavDrawer  → hamburger + slide-in drawer on narrow container
 *  - NavList          → menu links (via Prismic)
 *  - LanguageSelector → optional <select> dropdown, ALWAYS visible (også mobil)
 *  - HeaderCTAButton  → optional EviButton (asChild PrismicNextLink)
 *
 * Nav renderes to steder: inline på desktop, i draweren på mobil (kun én
 * synlig ad gangen). Bortset fra responsiv synlighed er alt Evi-komposition.
 */
export function HeaderClassicLayout({
  brand,
  primary,
  context,
  theme,
  className,
}: HeaderClassicLayoutProps): React.ReactElement {
  const {
    linkResolver,
    tenant,
    lang,
    languageSelectorEnabled,
    mobileNavBreakpoint,
    languages,
  } = context;

  const navBreakpoint = NAV_BREAKPOINT[mobileNavBreakpoint ?? ""] ?? "48rem";
  const navGroups = resolve_nav_groups(primary.nav_groups, linkResolver);
  const has_menu = navGroups.length > 0;
  const has_cta = is_link_filled(primary.cta_link);

  // Centreret nav-landmark, kun desktop. Display-toggle via .evi-nav-desktop
  // (EviHeaderShells injicerede container-query) — named class bærer display, så
  // der ikke opstår layer-konflikt med Tailwinds display-utility (jf. globals H).
  // Uden menupunkter intet landmark, ellers hører skærmlæsere en tom menu.
  const centerNav = has_menu ? (
    <nav aria-label="Hovedmenu" className="evi-nav-desktop">
      <NavGroupsDesktop groups={navGroups} lang={lang} />
    </nav>
  ) : undefined;

  // Højre zone: sprog + CTA på desktop, kompakt sprog + hamburger-drawer på mobil
  // (kun én cluster synlig ad gangen via .evi-nav-desktop/.evi-nav-mobile).
  const actions = (
    <>
      <div className="evi-nav-desktop">
        {languageSelectorEnabled && (
          <LanguageSelector
            locales={tenant.locales}
            currentLang={lang}
            languages={languages}
            className="shrink-0"
          />
        )}
        {has_cta && (
          <HeaderCTAButton link={primary.cta_link} linkResolver={linkResolver} />
        )}
      </div>

      <div className="evi-nav-mobile">
        {languageSelectorEnabled && (
          <LanguageSelector
            variant="compact"
            locales={tenant.locales}
            currentLang={lang}
            languages={languages}
            className="shrink-0"
          />
        )}
        {(has_menu || has_cta) && (
          <MobileNavDrawer>
            {has_menu && (
              <EviStack as="nav" aria-label="Hovedmenu" gap="xs">
                <NavGroupsMobile groups={navGroups} lang={lang} />
              </EviStack>
            )}
            {has_cta && (
              <HeaderCTAButton
                link={primary.cta_link}
                linkResolver={linkResolver}
                // eslint-disable-next-line evi/no-raw-layout-classes -- fuld-bredde CTA i drawer-footer (mt-auto); flex/justify-center centrerer knap-labelen — knap-styling, ikke et layout-container
                className="mt-auto flex w-full justify-center"
              />
            )}
          </MobileNavDrawer>
        )}
      </div>
    </>
  );

  return (
    <EviHeaderShell
      data-variant="classic"
      navBreakpoint={navBreakpoint}
      theme={theme}
      className={className}
    >
      <EviHeaderInner left={brand} center={centerNav} right={actions} />
    </EviHeaderShell>
  );
}
