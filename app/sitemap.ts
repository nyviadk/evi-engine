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

  const client = createTenantClient(tenant.repo);

  const pages = await client.getAllByType("page", {
    lang: "*",
    // Vi henter kun det vi absolut skal bruge
    fetch: [
      "page.uid",
      "page.last_publication_date",
      "page.alternate_languages",
    ],
  });

  // Filtrer sider uden UID væk for en sikkerheds skyld
  const valid_pages = pages.filter((doc) => doc.uid);

  return valid_pages.map((doc) => {
    // 1. Byg stien til selve siden
    const final_path = build_evi_url(doc.uid as string, doc.lang, tenant);

    // 2. Byg stierne til de oversatte versioner
    const alternates: Record<string, string> = {};
    doc.alternate_languages.forEach((alt) => {
      // TypeScript elsker at vi tjekker, om værdierne eksisterer!
      if (alt.uid && alt.lang) {
        const alt_path = build_evi_url(alt.uid, alt.lang, tenant);
        alternates[alt.lang] = `${base_url}${alt_path}`;
      }
    });

    return {
      url: `${base_url}${final_path}`,
      lastModified: new Date(doc.last_publication_date),
      alternates: {
        languages: Object.keys(alternates).length > 0 ? alternates : undefined,
      },
    };
  });
}
