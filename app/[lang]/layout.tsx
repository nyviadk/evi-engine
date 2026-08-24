import { headers } from "next/headers";
import { SliceZone } from "@prismicio/react";
import { EviColorTryBar } from "@/src/components/demo/EviColorTryBar";
import { DEFAULTS_COLORS } from "@/src/lib/theme/colors";
import { get_evi_context, get_evi_page } from "@/src/lib/prismic/context";
import { build_translation_url_map } from "@/src/lib/prismic/paths";
import HeaderClassic from "@/slices/HeaderClassic";
import type { EviHeaderSliceContext } from "@/src/components/header/types";
import { FooterClassic } from "@/src/components/footer/FooterClassic";
import { EviBeacon } from "@/src/components/analytics/EviBeacon";

const HEADER_COMPONENTS = {
  header_classic: HeaderClassic,
};

/**
 * Compute the canonical URL for each tenant locale using Prismic's
 * `alternate_languages`. Different languages have different UIDs (e.g.
 * `kontakt` vs `contact`) — string manipulation of the pathname would land
 * on the wrong URL. build_translation_url_map handles that via each
 * translated document's own id + lang.
 *
 * Locales missing a translation fall back to language home so the selector
 * always renders a working link — behavior specific to the LanguageSelector
 * (sitemap and hreflang metadata deliberately omit locales without
 * translation).
 */
function build_language_urls(
  page: Awaited<ReturnType<typeof get_evi_page>>,
  ctx: NonNullable<Awaited<ReturnType<typeof get_evi_context>>>,
): Record<string, string> {
  const translations = page
    ? [
        { id: page.id, uid: page.uid, lang: ctx.lang },
        ...page.alternate_languages,
      ]
    : [];
  const urls = build_translation_url_map(translations, ctx.tree, ctx.tenant);

  for (const locale of ctx.tenant.locales) {
    if (!urls[locale]) {
      const is_default_without_prefix =
        locale === ctx.tenant.default_locale && !ctx.tenant.force_lang_prefix;
      urls[locale] = is_default_without_prefix ? "/" : `/${locale}`;
    }
  }

  return urls;
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const [ctx, h] = await Promise.all([get_evi_context(), headers()]);

  // x-evi-pathname set by middleware, encoded to survive HTTP ASCII rules.
  const raw_pathname = h.get("x-evi-pathname");
  const current_pathname = raw_pathname ? decodeURI(raw_pathname) : "/";

  // Parse the current page's Prismic UID from the pathname so we can look up
  // its alternate_languages. Path shape: /<locale>/<...uid_segments>. Root
  // /<locale> maps to Prismic UID "home" (matches page.tsx convention).
  //
  // KOBLING: page.tsx udleder SAMME (uid, lang) fra route-params i stedet for
  // x-evi-pathname. De to udledninger SKAL give samme værdi — det er dét der
  // gør React.cache-dedup'et af get_evi_page under (ingen ekstra Prismic-
  // round-trip) holdbart. Ændrer du udledningen ét sted, ret det andet, ellers
  // genindføres et tavst duplikat-fetch (ingen test fanger det).
  const path_segments = current_pathname.split("/").filter(Boolean);
  const uid_segments = path_segments.slice(1);
  const prismic_uid = uid_segments[uid_segments.length - 1] || "home";

  const page = ctx ? await get_evi_page(prismic_uid, ctx.lang) : null;

  const header_slices = ctx?.navigation?.data?.slices ?? [];
  const header_language_selector_enabled =
    ctx?.navigation?.data?.language_selector === "Slået til";
  const footer_language_selector_enabled =
    ctx?.footer?.data?.language_selector === "Slået til";

  const home_href =
    ctx &&
    ctx.lang === ctx.tenant.default_locale &&
    !ctx.tenant.force_lang_prefix
      ? "/"
      : ctx
        ? `/${ctx.lang}`
        : "/";

  // Én gang for både header og footer — samme URL-map bruges begge steder.
  const language_urls = ctx ? build_language_urls(page, ctx) : {};

  const header_context: EviHeaderSliceContext | null = ctx
    ? {
        linkResolver: ctx.link_resolver,
        settings: ctx.settings,
        tenant: ctx.tenant,
        lang: ctx.lang,
        hostname: ctx.hostname,
        homeHref: home_href,
        currentPathname: current_pathname,
        languageSelectorEnabled: header_language_selector_enabled,
        mobileNavBreakpoint: ctx.navigation?.data?.mobile_nav_breakpoint,
        languageUrls: language_urls,
      }
    : null;

  // "Se med dine farver"-bjælken vises kun på vores demo/showcase-host + lokal
  // dev, aldrig på kunde-domæner. ctx.hostname er valideret; host-header er
  // fallback på localhost hvor der ingen tenant er.
  const host = ctx?.hostname ?? h.get("host") ?? "";
  const show_color_bar =
    host === "evi.nyvia.dk" || host.startsWith("localhost");

  // Sitets faktiske brandfarver → bjælkens baseline (server-props, så et enkelt
  // farve-skift ikke nulstiller de øvrige). Samme kilde som <html>'s tema-vars.
  const s = ctx?.settings?.data;
  const brandColors = {
    light: (s?.color_light as string) || DEFAULTS_COLORS.color_light,
    dark: (s?.color_dark as string) || DEFAULTS_COLORS.color_dark,
    primary: (s?.color_primary as string) || DEFAULTS_COLORS.color_primary,
    secondary: (s?.color_secondary as string) || DEFAULTS_COLORS.color_secondary,
  };

  return (
    <>
      {show_color_bar && (
        <EviColorTryBar initial={brandColors} lang={ctx?.lang ?? "da-dk"} />
      )}

      {header_context && (
        <SliceZone
          slices={header_slices}
          components={HEADER_COMPONENTS}
          context={header_context}
        />
      )}

      <div className="flex-1">{children}</div>

      {ctx?.footer && (
        <FooterClassic
          footer={ctx.footer}
          settings={ctx.settings}
          linkResolver={ctx.link_resolver}
          tenant={ctx.tenant}
          lang={ctx.lang}
          hostname={ctx.hostname}
          homeHref={home_href}
          allowBrandTranslation={ctx.settings?.data?.translate_brand === true}
          languageSelectorEnabled={footer_language_selector_enabled}
          languageUrls={language_urls}
        />
      )}

      {ctx && <EviBeacon locale={ctx.lang} />}
    </>
  );
}
