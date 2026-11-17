"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/src/lib/utils/cn";
import type { TenantConfig } from "@/src/lib/kv/tenants";
import {
  page_languages,
  type LanguageMap,
} from "@/src/lib/prismic/language-map";

export type LanguageSelectorProps = {
  locales: TenantConfig["locales"];
  currentLang: string;
  /**
   * Hele sitets sprogversioner (build_language_map), så forskellige UID'er pr.
   * sprog (kontakt ↔ contact) lander rigtigt. Den aktuelle side slås op her.
   */
  languages: LanguageMap;
  /**
   * "full" = native sprognavn + pil (desktop). "compact" = kun sprogkode (fx
   * "DA"), ingen pil — mindst mulig på mobil ved siden af hamburgeren.
   * @default "full"
   */
  variant?: "full" | "compact";
  className?: string;
};

/**
 * Native <select> dropdown for switching tenant locale. Viser kun de sprog,
 * den aktuelle side findes på, og intet, når det er færre end to. Siden slås
 * op på browserens sti: headeren og footeren bor i layoutet, som bliver stående
 * ved klient-navigation, så URL'er beregnet på serveren ville høre til den side,
 * man startede på. onChange går til siden på det valgte sprog.
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
 * Labels vises som endonym (hvert sprog i sit eget navn: "Dansk", "English") via
 * Intl.DisplayNames med locale som display-sprog. Dansk returnerer lowercase →
 * vi kapitaliserer første bogstav.
 *
 */
export function LanguageSelector({
  locales,
  currentLang,
  languages,
  variant = "full",
  className,
}: LanguageSelectorProps): React.ReactElement | null {
  const pathname = usePathname();
  const urls = page_languages(languages, pathname, currentLang);
  const available = locales.filter((locale) => urls[locale]);
  if (available.length < 2) return null;

  const compact = variant === "compact";

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const target_locale = event.target.value;
    if (target_locale === currentLang) return;
    const href = urls[target_locale];
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
          "evi-nav-lang cursor-pointer appearance-none rounded-evi border border-current/40 bg-current/5 text-sm text-current transition-colors hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-offset-2",
          // compact: kun sprogkode (fx DA), ingen pil → mindst mulig plads.
          compact ? "px-2 py-1.5" : "py-1.5 pr-9 pl-3",
          "[&>option]:bg-white [&>option]:text-neutral-900",
        )}
      >
        {available.map((locale) => {
          const language_code = locale.split("-")[0] ?? locale;
          let label = language_code.toUpperCase();
          if (!compact) {
            let raw_label = locale.toUpperCase();
            try {
              const native_display = new Intl.DisplayNames(locale, {
                type: "language",
              });
              raw_label = native_display.of(language_code) || raw_label;
            } catch {}
            label = raw_label.charAt(0).toUpperCase() + raw_label.slice(1);
          }
          return (
            <option key={locale} value={locale}>
              {label}
            </option>
          );
        })}
      </select>
      {!compact && (
        <svg
          aria-hidden="true"
          viewBox="0 0 12 8"
          fill="currentColor"
          className="pointer-events-none absolute top-1/2 right-3 h-2 w-3 -translate-y-1/2 opacity-70"
        >
          <path d="M6 8 0 0h12z" />
        </svg>
      )}
    </div>
  );
}
