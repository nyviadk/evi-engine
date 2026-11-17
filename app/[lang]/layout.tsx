import { headers } from "next/headers";
import { SliceZone } from "@prismicio/react";
import { EviColorTryBar } from "@/src/components/demo/EviColorTryBar";
import { DEFAULTS_COLORS } from "@/src/lib/theme/colors";
import { get_evi_context } from "@/src/lib/prismic/context";
import { components } from "@/slices";
import type { EviHeaderSliceContext } from "@/src/components/header/types";
import { FooterClassic } from "@/src/components/footer/FooterClassic";
import { EviBeacon } from "@/src/components/analytics/EviBeacon";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const [ctx, h] = await Promise.all([get_evi_context(), headers()]);

  // x-evi-pathname set by middleware, encoded to survive HTTP ASCII rules.
  const raw_pathname = h.get("x-evi-pathname");
  const current_pathname = raw_pathname ? decodeURI(raw_pathname) : "/";

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
        languages: ctx.languages,
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
        // Hele registret: navigation-typen bestemmer pr. repo, hvilke header-
        // slices zonen må have, så en ny variant (også planio_) virker uden
        // at layoutet kender den.
        <SliceZone
          slices={header_slices}
          components={components}
          context={header_context}
        />
      )}

      <main id="main" className="flex-1">
        {children}
      </main>

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
          languages={ctx.languages}
        />
      )}

      {ctx && <EviBeacon locale={ctx.lang} />}
    </>
  );
}
