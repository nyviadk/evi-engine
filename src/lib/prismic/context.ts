import { cache } from "react";
import { headers } from "next/headers";

import { get_tenant_config } from "@/src/lib/kv/tenants";
import { createTenantClient } from "@/prismicio";
import { build_page_tree, create_link_resolver } from "@/src/lib/prismic/paths";

/**
 * Fælles request-scope context.
 *
 * Alle tenant-aware sider, layouts, metadata-funktioner og komponenter
 * kalder denne funktion og får ALT relevant Prismic-data ud i én
 * Promise.all-batch. React's `cache()` sikrer at den kun kører én gang
 * per request — uanset om root layout, page metadata, page render og
 * navigation alle kalder den.
 *
 * Returnerer null for ikke-tenant hosts (caller renderer sin egen
 * fallback — typisk 404).
 *
 * Bemærk: settings og business hentes altid på `tenant.default_locale`
 * fordi de er site-globale (én version per repo). Navigation hentes på
 * request-locale med stille fallback til default-locale.
 */
export const get_evi_context = cache(async () => {
  const h = await headers();
  const hostname = h.get("host") || "localhost:3000";
  const tenant = await get_tenant_config(hostname);
  if (!tenant) return null;

  const client = createTenantClient(tenant);
  const lang = (h.get("x-evi-locale") || tenant.default_locale).toLowerCase();

  const [tree, settings, business, nav_in_lang] = await Promise.all([
    build_page_tree(client),
    client
      .getSingle("settings", { lang: tenant.default_locale })
      .catch(() => null),
    client
      .getSingle("business", { lang: tenant.default_locale })
      .catch(() => null),
    client.getSingle("navigation", { lang }).catch(() => null),
  ]);

  const navigation =
    nav_in_lang ||
    (lang !== tenant.default_locale
      ? await client
          .getSingle("navigation", { lang: tenant.default_locale })
          .catch(() => null)
      : null);

  const link_resolver = create_link_resolver(tree, tenant);

  return {
    hostname,
    lang,
    tenant,
    client,
    tree,
    link_resolver,
    settings,
    business,
    navigation,
  };
});

export type EviContext = NonNullable<
  Awaited<ReturnType<typeof get_evi_context>>
>;
