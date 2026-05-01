import { notFound, redirect, permanentRedirect } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import { headers } from "next/headers";
import { cache } from "react";

export const dynamic = "force-dynamic";

import { createTenantClient } from "@/prismicio";
import { components } from "@/slices";
import { get_tenant_config } from "@/src/lib/kv/tenants";
import {
  build_page_tree,
  resolve_page_url,
  create_link_resolver,
} from "@/src/lib/prismic/paths";
import { compute_slice_contexts } from "@/src/lib/prismic/slices";
import { DEFAULTS_COLORS } from "@/src/lib/theme/colors";
import { collectSchemaGraph } from "@/src/lib/seo/schemaCollector";
import { safeJsonLdStringify } from "@/src/lib/seo/safeJsonLdStringify";
import { is_staging_domain } from "@/src/lib/seo/domains";

type Params = Promise<{ lang: string; uid?: string[] }>;

/**
 * React cache() deduplikerer kald inden for samme request.
 * Både Page() og generateMetadata() kalder dette — data hentes kun én gang.
 */
const get_evi_context = cache(async (domain: string) => {
  const tenant = await get_tenant_config(domain);
  if (!tenant) return null;
  const client = createTenantClient(tenant);
  const tree = await build_page_tree(client);
  const [settings, business] = await Promise.all([
    client
      .getSingle("settings", { lang: tenant.default_locale })
      .catch(() => null),
    client
      .getSingle("business", { lang: tenant.default_locale })
      .catch(() => null),
  ]);
  return { tenant, client, tree, settings, business };
});

export default async function Page(props: { params: Params }) {
  const { lang, uid } = await props.params;
  const headers_list = await headers();
  const domain = headers_list.get("host") || "localhost:3000";

  const ctx = await get_evi_context(domain);
  if (!ctx) return notFound();

  const { client, tree, tenant, settings, business } = ctx;
  const prismic_uid = uid ? uid[uid.length - 1] : "home";

  // Stille fallback til default-locale hvis siden ikke findes på det forespurgte
  // sprog. Bedre end 404 når kunden har 2 sprog men kun oversat forsiden.
  // Ingen "ikke oversat endnu"-banner — det ville selv være en oversættelse
  // vi ikke kan vide hvilket sprog skal vises på.
  let page = await client
    .getByUID("page", prismic_uid, { lang })
    .catch(() => null);

  if (!page && lang !== tenant.default_locale) {
    page = await client
      .getByUID("page", prismic_uid, { lang: tenant.default_locale })
      .catch(() => null);
  }

  if (!page) return notFound();

  // Home må kun tilgås på roden — aldrig på /home eller /<noget>/home.
  // Catcher fx /da-dk/home, gamle indekserede links, copy-paste fejl.
  // 308 (permanent) fordi /home aldrig er en kanonisk URL i denne engine.
  if (page.uid === "home" && uid && uid.length > 0) {
    permanentRedirect(resolve_page_url(page.id, lang, tree, tenant));
  }

  // Validér at URL-stien matcher parent_page-kæden
  // F.eks. /om-os/vores-historie/kontakt er kun gyldig
  // hvis kontakt → parent: vores-historie → parent: om-os
  const expected = tree.get(page.id);
  const actual = uid || ["home"];

  if (expected && expected.join("/") !== actual.join("/")) {
    redirect(resolve_page_url(page.id, lang, tree, tenant));
  }

  const linkResolver = create_link_resolver(tree, tenant);
  const colors = {
    light: settings?.data?.color_light || DEFAULTS_COLORS.color_light,
    dark: settings?.data?.color_dark || DEFAULTS_COLORS.color_dark,
    primary: settings?.data?.color_primary || DEFAULTS_COLORS.color_primary,
    secondary:
      settings?.data?.color_secondary || DEFAULTS_COLORS.color_secondary,
  };
  const sliceContexts = compute_slice_contexts(page.data.slices, colors);

  // JSON-LD Schema
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${domain}`;
  const pagePath = resolve_page_url(page.id, lang, tree, tenant);

  const schemaGraph = collectSchemaGraph({
    business: business?.data ?? null,
    baseUrl,
    pagePath,
    pageTitle: page.data.meta_title || page.uid,
    lang,
    siteName: settings?.data?.site_name,
  });

  return (
    <>
      {schemaGraph && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLdStringify(schemaGraph),
          }}
        />
      )}
      <SliceZone
        slices={page.data.slices}
        components={components}
        context={{ linkResolver, sliceContexts }}
      />
    </>
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

  const { client, tree, tenant, settings } = ctx;
  const prismic_uid = uid ? uid[uid.length - 1] : "home";

  // Samme locale-fallback som i Page() så metadata matcher det viste indhold.
  let page = await client
    .getByUID("page", prismic_uid, { lang })
    .catch(() => null);

  if (!page && lang !== tenant.default_locale) {
    page = await client
      .getByUID("page", prismic_uid, { lang: tenant.default_locale })
      .catch(() => null);
  }

  if (!page) return {};
  const metaTitle = page.data.meta_title;
  const siteName = settings?.data?.site_name;
  const isHome = page.uid === "home";

  // 2. Find sidens navn (Prioritet: Meta felt -> Capitalized UID)
  const pageLabel =
    metaTitle || page.uid.charAt(0).toUpperCase() + page.uid.slice(1);

  // 3. Den "Smarte" Titel-logik
  let fullTitle: string;

  if (isHome && !metaTitle && siteName) {
    // Scenarie: Forsiden uden manuel titel -> "Frisør Jensen"
    fullTitle = siteName;
  } else if (siteName) {
    // Tjek om kunden selv har lavet branding (brugt en pipe | )
    if (metaTitle?.includes("|")) {
      fullTitle = metaTitle; // De har selv styret det, lad det være
    } else {
      // Standard: "Ydelser | Frisør Jensen"
      fullTitle = `${pageLabel} | ${siteName}`;
    }
  } else {
    // Fallback hvis firma-navn slet ikke er udfyldt
    fullTitle = pageLabel;
  }
  // URL-generering til SEO
  const canonical_path = resolve_page_url(page.id, lang, tree, tenant);
  const full_canonical_url = `${base_url}${canonical_path}`;

  // Alternate Languages (hreflang)
  // Kun relevant når siden reelt findes på flere sprog. En enkeltsproget
  // tenant, eller en side der kun er publiceret på ét sprog, skal ikke
  // have hreflang — det er støj der forvirrer Google.
  const alt_entries: Record<string, string> = {};
  for (const alt of page.alternate_languages) {
    if (alt.uid && alt.lang) {
      const alt_path = resolve_page_url(alt.id, alt.lang, tree, tenant);
      alt_entries[alt.lang] = `${base_url}${alt_path}`;
    }
  }

  let alternate_langs: Record<string, string> | undefined;
  if (Object.keys(alt_entries).length > 0) {
    // Inkluder den aktuelle side + alle faktiske oversættelser.
    alternate_langs = { [lang]: full_canonical_url, ...alt_entries };
    // x-default: peger på default-locale versionen hvis den findes.
    // Findes den ikke (side ikke oversat til default), udelader vi x-default.
    const x_default_url = alternate_langs[tenant.default_locale];
    if (x_default_url) {
      alternate_langs["x-default"] = x_default_url;
    }
  }

  // OG image fallback: page.meta_image → settings.default_og_image → null.
  // Hvis null, udelader vi images-arrayet helt — aldrig en tom <meta> tag.
  const og_image_url =
    page.data.meta_image?.url ||
    settings?.data?.default_og_image?.url ||
    null;

  // Staging-tjek
  const is_staging = is_staging_domain(domain);

  return {
    title: fullTitle,
    description: page.data.meta_description,

    // Canonical Tag
    alternates: {
      canonical: full_canonical_url,
      languages: alternate_langs,
    },

    // SEO Robots
    robots: is_staging
      ? { index: false, follow: false }
      : { index: true, follow: true },

    // Open Graph (Facebook, LinkedIn)
    openGraph: {
      title: fullTitle,
      description: page.data.meta_description,
      url: full_canonical_url,
      siteName: siteName,
      locale: lang,
      type: "website",
      ...(og_image_url && {
        images: [
          {
            url: og_image_url,
            width: 1200,
            height: 630,
            alt: fullTitle || "",
          },
        ],
      }),
    },

    // Twitter Cards (X)
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: page.data.meta_description,
      ...(og_image_url && { images: [og_image_url] }),
    },
  };
}
