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
    fetch: ["page.uid", "page.last_publication_date"],
  });

  const valid_pages = pages.filter((doc) => doc.uid);

  // 1. Grupperings-magien: Vi samler alle oversættelser under deres fælles UID
  const grouped_docs = new Map<string, typeof valid_pages>();

  valid_pages.forEach((doc) => {
    const uid = doc.uid as string;
    const group = grouped_docs.get(uid) || [];
    group.push(doc);
    grouped_docs.set(uid, group);
  });

  // 2. Byg sitemappet
  const sitemap_entries: MetadataRoute.Sitemap = [];

  // For hver gruppe (f.eks. alle "home" sider eller alle "kontakt" sider)
  for (const [uid, translations] of grouped_docs.entries()) {
    // a) Byg en liste over ALLE sprog i denne gruppe (inkl. siden selv)
    const all_alternates: Record<string, string> = {};
    translations.forEach((translation) => {
      const path = build_evi_url(uid, translation.lang, tenant);
      all_alternates[translation.lang] = `${base_url}${path}`;
    });

    // b) Opret en sitemap-entry for HVERT sprog, og giv dem alle den samme liste af alternates
    translations.forEach((translation) => {
      sitemap_entries.push({
        url: `${base_url}${build_evi_url(uid, translation.lang, tenant)}`,
        lastModified: new Date(translation.last_publication_date),
        alternates: {
          languages: all_alternates,
        },
      });
    });
  }

  return sitemap_entries;
}
