import { notFound } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import { headers } from "next/headers";

import { createTenantClient } from "@/prismicio";
import { components } from "@/slices";
import { build_evi_url, get_tenant_config } from "@/src/lib/tenants";

type Params = Promise<{ lang: string; uid?: string[] }>;

export default async function Page(props: { params: Params }) {
  const { lang, uid } = await props.params;

  const headers_list = await headers();
  const domain = headers_list.get("host") || "localhost:3000";

  const tenant = await get_tenant_config(domain);

  // DEBUG LOGS - Hold øje med din terminal!
  console.log("--- Evi Debug ---");
  console.log("Domæne:", domain);
  console.log("Fundet Tenant Repo:", tenant?.repo);
  console.log("Sprog fra URL:", lang);
  console.log("Søger efter UID:", uid ? uid[uid.length - 1] : "home");

  if (!tenant) {
    console.log("FEJL: Ingen tenant fundet for dette domæne");
    return notFound();
  }

  const prismic_uid = uid ? uid[uid.length - 1] : "home";
  const client = createTenantClient(tenant.repo);

  try {
    const page = await client.getByUID("page", prismic_uid, { lang });
    return <SliceZone slices={page.data.slices} components={components} />;
  } catch (error) {
    console.log("FEJL: Prismic kunne ikke finde dokumentet. Tjek ID og UID.");
    return notFound();
  }
}

export async function generateMetadata(props: { params: Params }) {
  const { lang, uid } = await props.params;
  const headers_list = await headers();
  const domain = headers_list.get("host") || "localhost:3000";

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const base_url = `${protocol}://${domain}`;

  const tenant = await get_tenant_config(domain);
  if (!tenant) return {};

  const prismic_uid = uid ? uid[uid.length - 1] : "home";
  const client = createTenantClient(tenant.repo);

  const page = await client
    .getByUID("page", prismic_uid, { lang })
    .catch(() => null);

  if (!page) return {};

  // 1. Byg den kanoniske URL via vores nye master-funktion
  const canonical_path = build_evi_url(prismic_uid, lang, tenant);

  // 2. Byg Alternate Languages (hreflang til Google)
  const alternate_langs: Record<string, string> = {};

  page.alternate_languages.forEach((alt) => {
    if (alt.uid && alt.lang) {
      const alt_path = build_evi_url(alt.uid, alt.lang, tenant);
      alternate_langs[alt.lang] = `${base_url}${alt_path}`;
    }
  });

  return {
    title: page.data.meta_title || "Evi Engine",
    description: page.data.meta_description,
    alternates: {
      canonical: `${base_url}${canonical_path}`,
      languages:
        Object.keys(alternate_langs).length > 0 ? alternate_langs : undefined,
    },
    openGraph: {
      images: [page.data.meta_image?.url || ""],
    },
  };
}
