import { headers } from "next/headers";
import { SliceZone } from "@prismicio/react";
import { EviTestBench } from "@/src/components/EviTestBench";
import { get_evi_context, get_evi_page } from "@/src/lib/prismic/context";
import { build_translation_url_map } from "@/src/lib/prismic/paths";
import HeaderClassic from "@/slices/HeaderClassic";
import type { EviHeaderSliceContext } from "@/src/components/header/types";
import { FooterClassic } from "@/src/components/footer/FooterClassic";

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
    ? [{ id: page.id, uid: page.uid, lang: ctx.lang }, ...page.alternate_languages]
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
}) {
  const [ctx, h] = await Promise.all([get_evi_context(), headers()]);

  // x-evi-pathname set by middleware, encoded to survive HTTP ASCII rules.
  const raw_pathname = h.get("x-evi-pathname");
  const current_pathname = raw_pathname ? decodeURI(raw_pathname) : "/";

  // Parse the current page's Prismic UID from the pathname so we can look up
  // its alternate_languages. Path shape: /<locale>/<...uid_segments>. Root
  // /<locale> maps to Prismic UID "home" (matches page.tsx convention).
  const path_segments = current_pathname.split("/").filter(Boolean);
  const uid_segments = path_segments.slice(1);
  const prismic_uid = uid_segments[uid_segments.length - 1] || "home";

  // Fetch page (React.cache dedups with page.tsx's identical call — no extra
  // Prismic round-trip). Returns null when there's no tenant, no page, or the
  // uid doesn't exist in the current locale.
  const page = ctx
    ? await get_evi_page(prismic_uid, ctx.lang)
    : null;

  const header_slices = ctx?.navigation?.data?.slices ?? [];
  const language_selector_enabled =
    ctx?.navigation?.data?.language_selector === "Slået til";

  const home_href =
    ctx && ctx.lang === ctx.tenant.default_locale && !ctx.tenant.force_lang_prefix
      ? "/"
      : ctx
        ? `/${ctx.lang}`
        : "/";

  const header_context: EviHeaderSliceContext | null = ctx
    ? {
        linkResolver: ctx.link_resolver,
        settings: ctx.settings,
        tenant: ctx.tenant,
        lang: ctx.lang,
        hostname: ctx.hostname,
        homeHref: home_href,
        currentPathname: current_pathname,
        languageSelectorEnabled: language_selector_enabled,
        languageUrls: build_language_urls(page, ctx),
      }
    : null;

  return (
    <>
      {header_context && (
        <SliceZone
          slices={header_slices}
          components={HEADER_COMPONENTS}
          context={header_context}
        />
      )}

      <EviTestBench />
      {children}

      {ctx?.footer && (
        <FooterClassic
          footer={ctx.footer}
          settings={ctx.settings}
          linkResolver={ctx.link_resolver}
          hostname={ctx.hostname}
          homeHref={home_href}
          allowBrandTranslation={ctx.settings?.data?.translate_brand === true}
        />
      )}
    </>
  );
}
