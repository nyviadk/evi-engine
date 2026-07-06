import { MetadataRoute } from "next";
import {
  get_evi_tenant,
  get_evi_tree,
  get_evi_sitemap_pages,
} from "@/src/lib/prismic/context";
import {
  build_translation_url_map,
  resolve_page_url,
} from "@/src/lib/prismic/paths";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Tenant skal være kendt før vi kan bygge base_url; tree + pages fyres
  // parallelt da de er uafhængige Prismic-kald. cache() i context.ts sikrer
  // tenant-lookup'et kun sker én gang selvom alle tre helpers bruger det.
  const tenant_ctx = await get_evi_tenant();
  if (!tenant_ctx) return [];

  const { tenant, hostname } = tenant_ctx;
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const base_url = `${protocol}://${hostname}`;

  try {
    const [tree, pages] = await Promise.all([
      get_evi_tree(),
      get_evi_sitemap_pages(),
    ]);
    if (!tree || !pages) return [];

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
      const languages = build_translation_url_map(
        translations,
        tree,
        tenant,
        base_url,
      );

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
