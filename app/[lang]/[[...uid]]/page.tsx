import { notFound, redirect } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import { headers } from "next/headers";
import { cache } from "react";

import { createTenantClient } from "@/prismicio";
import { components } from "@/slices";
import { get_tenant_config } from "@/src/lib/tenants";
import {
  build_page_tree,
  resolve_page_url,
  create_link_resolver,
} from "@/src/lib/paths";
import { compute_slice_contexts } from "@/src/lib/slices";

type Params = Promise<{ lang: string; uid?: string[] }>;

// React cache() deduplicerer inden for ét request.
// Både Page() og generateMetadata() kalder dette — det kører kun én gang.
const get_evi_context = cache(async (domain: string) => {
  const tenant = await get_tenant_config(domain);
  if (!tenant) return null;
  const client = createTenantClient(tenant);
  const tree = await build_page_tree(client);
  return { tenant, client, tree };
});

export default async function Page(props: { params: Params }) {
  const { lang, uid } = await props.params;

  const headers_list = await headers();
  const domain = headers_list.get("host") || "localhost:3000";

  const ctx = await get_evi_context(domain);
  if (!ctx) return notFound();

  const { client, tree, tenant } = ctx;
  const prismic_uid = uid ? uid[uid.length - 1] : "home";

  // .catch() i stedet for try/catch — redirect() kaster NEXT_REDIRECT internt
  const page = await client
    .getByUID("page", prismic_uid, { lang })
    .catch(() => null);

  if (!page) return notFound();

  // Validér at URL-stien matcher parent_page-kæden
  // F.eks. /om-os/vores-historie/kontakt er kun gyldig
  // hvis kontakt → parent: vores-historie → parent: om-os
  const expected = tree.get(page.id);
  const actual = uid || ["home"];

  if (expected && expected.join("/") !== actual.join("/")) {
    redirect(resolve_page_url(page.id, lang, tree, tenant));
  }

  const linkResolver = create_link_resolver(tree, tenant);
  const sliceContexts = compute_slice_contexts(page.data.slices);

  return (
    <SliceZone
      slices={page.data.slices}
      components={components}
      context={{ linkResolver, sliceContexts }}
    />
  );
}

export async function generateMetadata(props: { params: Params }) {
  const { lang, uid } = await props.params;
  const headers_list = await headers();
  const domain = headers_list.get("host") || "localhost:3000";

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const base_url = `${protocol}://${domain}`;

  const ctx = await get_evi_context(domain);
  if (!ctx) return {};

  const { client, tree, tenant } = ctx;
  const prismic_uid = uid ? uid[uid.length - 1] : "home";

  const page = await client
    .getByUID("page", prismic_uid, { lang })
    .catch(() => null);

  if (!page) return {};

  // Kanonisk URL fra sti-træet (håndterer alle dybder)
  const canonical_path = resolve_page_url(page.id, lang, tree, tenant);

  // Alternate Languages (hreflang til Google)
  const alternate_langs: Record<string, string> = {};

  for (const alt of page.alternate_languages) {
    if (alt.uid && alt.lang) {
      const alt_path = resolve_page_url(alt.id, alt.lang, tree, tenant);
      alternate_langs[alt.lang] = `${base_url}${alt_path}`;
    }
  }

  // Staging-tjek: Bloker indeksering på test-domæner
  const is_staging =
    domain.endsWith(".web.nyvia.dk") || domain.includes("localhost");

  return {
    title: page.data.meta_title,
    description: page.data.meta_description,
    alternates: {
      canonical: `${base_url}${canonical_path}`,
      languages:
        Object.keys(alternate_langs).length > 0 ? alternate_langs : undefined,
    },
    robots: is_staging
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      images: [page.data.meta_image?.url || ""],
    },
  };
}
