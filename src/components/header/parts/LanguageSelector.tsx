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
 * Language labels come from Intl.DisplayNames, translated to the current
 * locale (Danish visitor sees "Dansk"/"Engelsk", English sees "Danish"/
 * "English"). Danish returns lowercase from Intl ("dansk"); we capitalize
 * the first letter to match UI convention.
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

  let display: Intl.DisplayNames | null = null;
  try {
    display = new Intl.DisplayNames(currentLang, { type: "language" });
  } catch {
    display = null;
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const target_locale = event.target.value;
    if (target_locale === currentLang) return;
    const href = languageUrls[target_locale];
    if (href) window.location.href = href;
  };

  return (
    <select
      value={currentLang}
      onChange={handleChange}
      aria-label="Vælg sprog"
      className={cn(
        "evi-nav-lang @3xl/nav:inline-block hidden cursor-pointer rounded-evi border border-current/20 bg-transparent px-3 py-1.5 text-sm text-current focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
    >
      {locales.map((locale) => {
        const language_code = locale.split("-")[0];
        const raw_label = display?.of(language_code) || locale.toUpperCase();
        const label = raw_label.charAt(0).toUpperCase() + raw_label.slice(1);
        return (
          <option key={locale} value={locale}>
            {label}
          </option>
        );
      })}
    </select>
  );
}
