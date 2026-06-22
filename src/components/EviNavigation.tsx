import { PrismicNextLink } from "@prismicio/next";
import { isFilled } from "@prismicio/client";

import { get_evi_context } from "@/src/lib/prismic/context";
import { EviNavigationDisclosure } from "@/src/components/EviNavigationDisclosure";

export async function EviNavigation() {
  const ctx = await get_evi_context();
  if (!ctx) return null;

  const { tenant, lang, link_resolver, settings, navigation, hostname } = ctx;

  // Home-URL respekterer force_lang_prefix og default-locale uden prefix.
  const home_href =
    lang === tenant.default_locale && !tenant.force_lang_prefix
      ? "/"
      : `/${lang}`;

  const brand =
    (isFilled.keyText(settings?.data?.site_name)
      ? settings?.data?.site_name
      : null) || hostname;

  // Default: bevar originalt sitenavn (translate="no") — beskytter brand
  // mod at fx Google Translate forvrænger det. Tenant kan slå fra i Prismic
  // hvis brandet faktisk SKAL oversættes på tværs af sprog.
  const allow_brand_translation = settings?.data?.translate_brand === true;
  const brand_translate_attr = allow_brand_translation ? undefined : "no";

  const links = navigation?.data?.links ?? [];

  return (
    <header className="evi-nav theme-light @container/nav relative border-b border-current/10">
      <div className="mx-auto flex max-w-evi items-center justify-between gap-4 px-4 py-3">
        <a
          href={home_href}
          translate={brand_translate_attr}
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
