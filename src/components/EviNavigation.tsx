import { headers } from "next/headers";
import { cache } from "react";
import { PrismicNextLink } from "@prismicio/next";
import { isFilled } from "@prismicio/client";

import { get_tenant_config } from "@/src/lib/kv/tenants";
import { createTenantClient } from "@/prismicio";
import { build_page_tree, create_link_resolver } from "@/src/lib/prismic/paths";
import { EviNavigationDisclosure } from "@/src/components/EviNavigationDisclosure";

const get_nav_context = cache(async (hostname: string, lang: string) => {
  const tenant = await get_tenant_config(hostname);
  if (!tenant) return null;

  const client = createTenantClient(tenant);

  // Hent nav-dokumentet på det aktuelle sprog, fald stille tilbage til
  // default_locale hvis det ikke er oversat. Page-træet bruges til at
  // resolve interne dokument-links til faktiske URL'er.
  const [tree, nav_current, settings] = await Promise.all([
    build_page_tree(client),
    client.getSingle("navigation", { lang }).catch(() => null),
    client
      .getSingle("settings", { lang: tenant.default_locale })
      .catch(() => null),
  ]);

  let nav = nav_current;
  if (!nav && lang !== tenant.default_locale) {
    nav = await client
      .getSingle("navigation", { lang: tenant.default_locale })
      .catch(() => null);
  }

  return { tenant, tree, nav, settings };
});

export async function EviNavigation() {
  const h = await headers();
  const hostname = h.get("host") || "localhost:3000";
  const lang = h.get("x-evi-locale") || "da-dk";

  const ctx = await get_nav_context(hostname, lang);
  if (!ctx) return null;

  const { tenant, tree, nav, settings } = ctx;

  const link_resolver = create_link_resolver(tree, tenant);

  // Home-URL respekterer force_lang_prefix og default-locale uden prefix.
  const home_href =
    lang === tenant.default_locale && !tenant.force_lang_prefix
      ? "/"
      : `/${lang}`;

  const brand =
    (isFilled.keyText(settings?.data?.site_name)
      ? settings?.data?.site_name
      : null) || hostname;

  const links = nav?.data?.links ?? [];

  return (
    <header className="evi-nav theme-light @container/nav relative border-b border-current/10">
      <div className="mx-auto flex max-w-evi items-center justify-between gap-4 px-4 py-3">
        <a
          href={home_href}
          className="evi-nav-brand font-heading text-lg font-semibold text-current hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 rounded-evi"
        >
          {brand}
        </a>

        <nav aria-label="Hovedmenu">
          <EviNavigationDisclosure>
            <ul className="evi-nav-list">
              {links.map((link, i) => {
                if (!isFilled.link(link)) return null;
                const label = isFilled.keyText(link.text) ? link.text : null;
                if (!label) return null;
                return (
                  <li key={i}>
                    <PrismicNextLink
                      field={link}
                      linkResolver={link_resolver}
                      className="block rounded-evi px-3 py-2 text-current no-underline hover:bg-current/5 focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {label}
                    </PrismicNextLink>
                  </li>
                );
              })}
            </ul>
          </EviNavigationDisclosure>
        </nav>
      </div>
    </header>
  );
}
