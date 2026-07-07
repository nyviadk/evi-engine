"use client";

import { cn } from "@/src/lib/utils/cn";
import type { TenantConfig } from "@/src/lib/kv/tenants";

export type LanguageSelectorProps = {
  locales: TenantConfig["locales"];
  currentLang: string;
  /**
   * Pre-computed URL for each locale. Values come from Prismic's
   * alternate_languages via resolve_page_url — so different-UID translations
   * (kontakt ↔ contact) land correctly. Layout constructs the map.
   */
  languageUrls: Record<string, string>;
  className?: string;
};

/**
 * Native <select> dropdown for switching tenant locale. Server sends the URL
 * for each locale via `languageUrls`; onChange navigates to the chosen
 * language's version of the current page (or that language's home if the
 * current page has no translation).
 *
 * Native <select> gives us keyboard navigation, mobile-native pickers, and
 * ARIA out of the box. Client component because onChange navigates.
 *
 * Full page reload via window.location (not router.push) because:
 *  1) A language switch replaces the entire tree — soft-nav's partial
 *     re-render is misleading UX for such a semantic change.
 *  2) router.push had a scroll-to-bottom bug in the RSC transition when the
 *     new page has different height. Full reload sidesteps browser scroll-
 *     restoration entirely: fresh URL, browser defaults scroll to top.
 *
 * Language labels vises i det NATIVE sprog for hver locale — dvs. dansk står
 * som "Dansk" og engelsk som "English" uanset hvilken locale brugeren i
 * øjeblikket er på. Dette matcher konventionen på multilinguale sites (bruger
 * skal kunne genkende sit eget sprog uden at kunne sitets nuværende sprog).
 * Intl.DisplayNames instantieres per option med den locale som display-sprog,
 * så .of(language_code) returnerer endonymet. Dansk returnerer lowercase fra
 * Intl ("dansk"); vi kapitaliserer første bogstav.
 *
 * Silently renders nothing when the tenant only has one locale — nothing to
 * switch to.
 */
export function LanguageSelector({
  locales,
  currentLang,
  languageUrls,
  className,
}: LanguageSelectorProps): React.ReactElement | null {
  if (locales.length < 2) return null;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const target_locale = event.target.value;
    if (target_locale === currentLang) return;
    const href = languageUrls[target_locale];
    if (href) window.location.href = href;
  };

  return (
    // Wrapper for custom chevron. `className` fra caller lander her (visibility
    // som `hidden @3xl/nav:inline-block` skal gemme HELE kontrollen, ikke kun
    // select-elementet).
    <div className={cn("relative inline-block", className)}>
      <select
        value={currentLang}
        onChange={handleChange}
        aria-label="Vælg sprog"
        className={cn(
          "evi-nav-lang cursor-pointer appearance-none rounded-evi border border-current/40 bg-current/5 py-1.5 pr-9 pl-3 text-sm text-current transition-colors hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-offset-2",
          "[&>option]:bg-white [&>option]:text-neutral-900",
        )}
      >
        {locales.map((locale) => {
          const language_code = locale.split("-")[0];
          let raw_label = locale.toUpperCase();
          try {
            const native_display = new Intl.DisplayNames(locale, {
              type: "language",
            });
            raw_label = native_display.of(language_code) || raw_label;
          } catch {}
          const label = raw_label.charAt(0).toUpperCase() + raw_label.slice(1);
          return (
            <option key={locale} value={locale}>
              {label}
            </option>
          );
        })}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 12 8"
        fill="currentColor"
        className="pointer-events-none absolute top-1/2 right-3 h-2 w-3 -translate-y-1/2 opacity-70"
      >
        <path d="M6 8 0 0h12z" />
      </svg>
    </div>
  );
}
