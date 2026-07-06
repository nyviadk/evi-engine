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
 * Renders a horizontal list of available locales for the current tenant.
 * The current locale is marked with aria-current and styled as non-linked;
 * others link to the corresponding translated page URL.
 *
 * Silently renders nothing when the tenant only has one locale — there is
 * nothing to switch to.
 *
 * Language labels come from Intl.DisplayNames, translated to the current
 * locale (Danish visitor sees "Dansk"/"Engelsk", English sees "Danish"/
 * "English"). Falls back to uppercase locale code if Intl.DisplayNames is
 * unavailable at runtime.
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

  return (
    <ul
      className={cn(
        "evi-nav-lang flex items-center gap-2 text-sm",
        className,
      )}
      aria-label="Sprogvælger"
    >
      {locales.map((locale) => {
        const is_current = locale === currentLang;
        const target_href = languageUrls[locale];

        // Intl.DisplayNames wants the primary language subtag ("da" from "da-dk").
        const language_code = locale.split("-")[0];
        const label = display?.of(language_code) || locale.toUpperCase();

        if (is_current) {
          return (
            <li
              key={locale}
              aria-current="true"
              className="font-medium text-current"
            >
              <span>{label}</span>
            </li>
          );
        }
        // Defensive: if layout somehow produced no URL for this locale, skip.
        if (!target_href) return null;
        return (
          <li key={locale}>
            <a
              href={target_href}
              hrefLang={locale}
              className="rounded-evi px-2 py-1 text-current/70 no-underline hover:text-current focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
