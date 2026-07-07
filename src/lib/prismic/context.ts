import { cache } from "react";
import { headers } from "next/headers";

import { get_tenant_config } from "@/src/lib/kv/tenants";
import { createTenantClient } from "@/prismicio";
import { build_page_tree, create_link_resolver } from "@/src/lib/prismic/paths";

/**
 * Centraliseret request-scope Prismic data-adgang.
 *
 * ALLE Prismic-fetches lever i denne fil. Route-filer skal aldrig kalde
 * `client.getX(...)` direkte — de bruger de eksporterede cached helpers
 * herunder. Hvis du har brug for noget der ikke findes endnu, tilføj
 * det her som en ny `get_evi_*` helper.
 *
 * Alle helpers er wrapped i React `cache()` så de højst kører én gang
 * per request, uanset hvor mange consumers der kalder dem.
 *
 * Tiers:
 *  - **Tier 0 (`get_evi_tenant`)** — header-læsning + KV-lookup + klient.
 *    Ingen Prismic-kald. Bruges som base af alle andre helpers.
 *  - **Tier 1 (per-route)** — enkelt-formålede fetches der kan fyres
 *    parallelt: `get_evi_page`, `get_evi_tree`, `get_evi_sitemap_pages`.
 *  - **Tier 2 (`get_evi_context`)** — det store batch til layouts:
 *    tree + settings + business + navigation i én Promise.all.
 *
 * Mønster i route-filer:
 * ```ts
 * const [ctx, page] = await Promise.all([
 *   get_evi_context(),       // batch
 *   get_evi_page(uid, lang), // per-route, parallelt med batch
 * ]);
 * ```
 */

// ── Tier 0: tenant + client (ingen Prismic-kald) ──

export const get_evi_tenant = cache(async () => {
  const h = await headers();
  const hostname = h.get("host") || "localhost:3000";
  const tenant = await get_tenant_config(hostname);
  if (!tenant) return null;

  const client = createTenantClient(tenant);
  const lang = (h.get("x-evi-locale") || tenant.default_locale).toLowerCase();

  return { hostname, lang, tenant, client };
});

export type EviTenantContext = NonNullable<
  Awaited<ReturnType<typeof get_evi_tenant>>
>;

// ── Tier 1: per-route helpers ──

/**
 * Sti-træ for ALLE sider. Bruges af både sitemap og det fælles context-batch.
 */
export const get_evi_tree = cache(async () => {
  const base = await get_evi_tenant();
  if (!base) return null;
  return build_page_tree(base.client);
});

/**
 * En enkelt side på det forespurgte sprog med stille fallback til
 * `tenant.default_locale` hvis siden ikke findes oversat. Returnerer
 * `null` for både tenant-less hosts og uoversatte sider.
 */
export const get_evi_page = cache(
  async (prismic_uid: string, lang: string) => {
    const base = await get_evi_tenant();
    if (!base) return null;
    const { client, tenant } = base;

    const page_in_lang = await client
      .getByUID("page", prismic_uid, { lang })
      .catch(() => null);

    if (page_in_lang) return page_in_lang;
    if (lang === tenant.default_locale) return null;

    return client
      .getByUID("page", prismic_uid, { lang: tenant.default_locale })
      .catch(() => null);
  },
);

/**
 * Alle sider på tværs af sprog med kun de felter sitemap.xml behøver
 * (uid, last_publication_date, alternate_languages, lang).
 */
export const get_evi_sitemap_pages = cache(async () => {
  const base = await get_evi_tenant();
  if (!base) return null;
  return base.client.getAllByType("page", {
    lang: "*",
    fetch: [
      "page.uid",
      "page.last_publication_date",
      "page.alternate_languages",
      "page.lang",
    ],
  });
});

// ── Tier 2: full site-globale batch ──

export const get_evi_context = cache(async () => {
  const base = await get_evi_tenant();
  if (!base) return null;
  const { client, lang, tenant } = base;

  // get_evi_tree bruges her så cache-entry'en kan deles med direkte tree-
  // konsumenter (sitemap). Inden i Promise.all bliver det stadig parallelt.
  const [tree, settings, business, nav_in_lang, footer_in_lang] =
    await Promise.all([
      get_evi_tree(),
      client
        .getSingle("settings", { lang: tenant.default_locale })
        .catch(() => null),
      client
        .getSingle("business", { lang: tenant.default_locale })
        .catch(() => null),
      client.getSingle("navigation", { lang }).catch(() => null),
      client.getSingle("footer", { lang }).catch(() => null),
    ]);

  // tree kan kun være null hvis tenant manglede — men base er allerede
  // tjekket. Vi narrower derfor strengt før vi bygger link_resolver.
  if (!tree) return null;

  // Navigation og footer fetches i den ønskede locale først; falder tilbage
  // til default_locale hvis oversættelsen ikke findes — så editoren ikke
  // skal duplikere identisk chrome-indhold på tværs af sprog.
  const navigation =
    nav_in_lang ||
    (lang !== tenant.default_locale
      ? await client
          .getSingle("navigation", { lang: tenant.default_locale })
          .catch(() => null)
      : null);
  const footer =
    footer_in_lang ||
    (lang !== tenant.default_locale
      ? await client
          .getSingle("footer", { lang: tenant.default_locale })
          .catch(() => null)
      : null);

  const link_resolver = create_link_resolver(tree, tenant);

  return {
    ...base,
    tree,
    link_resolver,
    settings,
    business,
    navigation,
    footer,
  };
});

export type EviContext = NonNullable<
  Awaited<ReturnType<typeof get_evi_context>>
>;
