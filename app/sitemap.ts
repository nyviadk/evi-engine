import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { get_tenant_config, build_evi_url } from "@/src/lib/tenants";
import { createTenantClient } from "@/prismicio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headers_list = await headers();
  const domain = headers_list.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const base_url = `${protocol}://${domain}`;

  const tenant = await get_tenant_config(domain);
  if (!tenant) return [];

  // 1. Definer variablen herude, så den er tilgængelig i hele funktionen
  let sitemap_entries: MetadataRoute.Sitemap = [];

  try {
    const client = createTenantClient(tenant.repo);

    const pages = await client.getAllByType("page", {
      lang: "*",
      // Vi henter kun det vi absolut skal bruge for at spare på båndbredden
      fetch: [
        "page.uid",
        "page.last_publication_date",
        "page.alternate_languages",
        "page.lang",
      ],
    });

    const resolvableDocs = pages.filter((doc) => doc.uid);

    // 2. GRUPPERINGS-LOGIK (Inspireret af dit gamle projekt)
    // Vi grupperer alle oversættelser under ID'et på den version, der matcher default_locale
    const groupedDocs = new Map<string, typeof resolvableDocs>();

    resolvableDocs.forEach((doc) => {
      let groupId: string;

      if (doc.lang === tenant.default_locale) {
        // Hvis dokumentet er på standardsproget, er det selv ankeret
        groupId = doc.id;
      } else {
        // Find ID'et på den version, der matcher vores default_locale i tenant.ts
        const defaultLangAlternate = doc.alternate_languages.find(
          (alt) => alt.lang === tenant.default_locale,
        );
        // Fallback til sit eget ID, hvis der ikke er linket en version på standardsproget
        groupId = defaultLangAlternate?.id || doc.id;
      }

      const translations = groupedDocs.get(groupId) || [];
      translations.push(doc);
      groupedDocs.set(groupId, translations);
    });

    // 3. GENERER ENTRIES
    const entries = Array.from(groupedDocs.values()).flatMap((translations) => {
      const alternates: { languages: Record<string, string> } = {
        languages: {},
      };

      // Byg alternates-objektet (Hreflang) først for denne gruppe
      translations.forEach((translation) => {
        if (translation.uid) {
          const path = build_evi_url(translation.uid, translation.lang, tenant);
          alternates.languages[translation.lang] = `${base_url}${path}`;
        }
      });

      // Returner en sitemap-entry for hvert sprog i gruppen
      return translations.map((doc) => {
        return {
          url: `${base_url}${build_evi_url(doc.uid!, doc.lang, tenant)}`,
          lastModified: new Date(doc.last_publication_date),
          alternates: alternates,
        };
      });
    });

    return entries;
  } catch (error) {
    console.error("Sitemap fejl:", error);
    return []; // Returner et tomt sitemap i stedet for at crashe hele motoren
  }
}
