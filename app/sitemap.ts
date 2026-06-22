import { MetadataRoute } from "next";
import { get_evi_context } from "@/src/lib/prismic/context";
import { resolve_page_url } from "@/src/lib/prismic/paths";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ctx = await get_evi_context();
  if (!ctx) return [];

  const { client, tree, tenant, hostname } = ctx;
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const base_url = `${protocol}://${hostname}`;

  try {
    const pages = await client.getAllByType("page", {
      lang: "*",
      fetch: [
        "page.uid",
        "page.last_publication_date",
        "page.alternate_languages",
        "page.lang",
      ],
    });

    const resolvable = pages.filter((doc) => doc.uid);

    // Gruppér oversættelser under default-locale versionen (til hreflang)
    const grouped = new Map<string, typeof resolvable>();

    for (const doc of resolvable) {
      let group_id: string;

      if (doc.lang === tenant.default_locale) {
        group_id = doc.id;
      } else {
        const default_alt = doc.alternate_languages.find(
          (alt) => alt.lang === tenant.default_locale,
        );
        group_id = default_alt?.id || doc.id;
      }

      const translations = grouped.get(group_id) || [];
      translations.push(doc);
      grouped.set(group_id, translations);
    }

    // Generér sitemap-entries med korrekte fulde stier fra sti-træet
    const entries = Array.from(grouped.values()).flatMap((translations) => {
      // Kun udstil hreflang når siden reelt findes på flere sprog.
      // Enkeltsproget tenant eller side kun på ét sprog → ingen alternates.
      const languages: Record<string, string> = {};
      for (const t of translations) {
        if (t.uid) {
          const path = resolve_page_url(t.id, t.lang, tree, tenant);
          languages[t.lang] = `${base_url}${path}`;
        }
      }

      const has_real_alternates = Object.keys(languages).length > 1;
      if (has_real_alternates) {
        const x_default_url = languages[tenant.default_locale];
        if (x_default_url) {
          languages["x-default"] = x_default_url;
        }
      }

      return translations.map((doc) => ({
        url: `${base_url}${resolve_page_url(doc.id, doc.lang, tree, tenant)}`,
        lastModified: new Date(doc.last_publication_date),
        ...(has_real_alternates && { alternates: { languages } }),
      }));
    });

    return entries;
  } catch (error) {
    console.error("Sitemap fejl:", error);
    return [];
  }
}
