import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound, redirect, permanentRedirect } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import { asHTML, asText, isFilled } from "@prismicio/client";

import { components } from "@/slices";
import {
  build_translation_url_map,
  resolve_page_url,
} from "@/src/lib/prismic/paths";
import { get_evi_context, get_evi_page } from "@/src/lib/prismic/context";
import { compute_slice_contexts } from "@/src/lib/prismic/slices";
import { DEFAULTS_COLORS } from "@/src/lib/theme/colors";
import { collectSchemaGraph } from "@/src/lib/seo/schemaCollector";
import { safeJsonLdStringify } from "@/src/lib/seo/safeJsonLdStringify";
import { is_staging_domain } from "@/src/lib/seo/domains";

type Params = Promise<{ lang: string; uid?: string[] }>;

export default async function Page(props: {
  params: Params;
}): Promise<ReactElement> {
  // KOBLING: layout.tsx udleder SAMME (uid, lang) fra x-evi-pathname i stedet
  // for route-params. Hold de to udledninger i sync — det er dét der lader
  // get_evi_page's React.cache dedup'e på tværs af layout + page (ét fetch).
  const { lang, uid } = await props.params;
  const prismic_uid = uid?.[uid.length - 1] ?? "home";

  // Fyr side-fetch parallelt med det globale context-batch. get_evi_context()
  // henter tree+settings+business+navigation; get_evi_page() henter selve
  // siden (med stille fallback til default-locale). De er uafhængige, så
  // de skal IKKE await'es sequentielt. cache() i context.ts sikrer at
  // tenant-lookup'et kun sker én gang selvom begge helpers internt bruger det.
  const [ctx, page] = await Promise.all([
    get_evi_context(),
    get_evi_page(prismic_uid, lang),
  ]);
  if (!ctx) return notFound();
  if (!page) return notFound();

  const { tree, tenant, settings, business, link_resolver, hostname } = ctx;

  // Home må kun tilgås på roden. Komplementær til middleware'ens
  // redirect_home_to_root: den fanger den bogstavelige /home-URL, DETTE fanger
  // en side hvis uid er "home" men nås via en ikke-home-sti. Samme regel, samme
  // status (308) — ret begge hvis reglen ændres.
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
  const baseUrl = `${protocol}://${hostname}`;

  // Breadcrumbs med rigtige sidetitler: trail'en (fra sti-træets fetch) bærer
  // titlerne, page opløser hvert led til en fuld URL.
  const breadcrumbs = (ctx.breadcrumbTrails.get(page.id) ?? []).map((crumb) => ({
    name: crumb.title,
    url: `${baseUrl}${resolve_page_url(crumb.id, lang, tree, tenant)}`,
  }));

  // FAQ → FAQPage-schema: saml alle faq-slices' Q&A (kun udfyldte par). asHTML
  // bevarer links/lister i svaret (Answer.text tillader begrænset HTML) — kræver
  // link_resolver til interne Prismic-links. Alle par flettes til ÉN FAQPage
  // (Google: max én pr. side). pageUrl = samme udtryk som canonical.
  const pageUrl = `${baseUrl}${resolve_page_url(page.id, lang, tree, tenant)}`;
  const faqItems = page.data.slices
    .flatMap((s) => (s.slice_type === "faq" ? s.primary.items : []))
    .filter((it) => isFilled.richText(it.question) && isFilled.richText(it.answer))
    .map((it) => ({
      question: asText(it.question),
      answer: asHTML(it.answer, { linkResolver: link_resolver }),
    }));

  const schemaGraph = collectSchemaGraph({
    business: business?.data ?? null,
    baseUrl,
    pageUrl,
    breadcrumbs,
    siteName: settings?.data?.site_name,
    faqItems,
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
        context={{ linkResolver: link_resolver, sliceContexts }}
      />
    </>
  );
}

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  const { lang, uid } = await props.params;
  const prismic_uid = uid?.[uid.length - 1] ?? "home";

  // Samme parallel-mønster som Page(): context-batch + side-fetch fyres
  // samtidig. get_evi_page håndterer locale-fallback internt, så metadata
  // og rendret indhold altid matcher.
  const [ctx, page] = await Promise.all([
    get_evi_context(),
    get_evi_page(prismic_uid, lang),
  ]);
  if (!ctx) return {};
  if (!page) return {};

  const { tree, tenant, settings, hostname } = ctx;
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const base_url = `${protocol}://${hostname}`;
  const metaTitle = page.data.meta_title;
  const siteName = settings?.data?.site_name;
  const isHome = page.uid === "home";

  const pageLabel =
    metaTitle || page.uid.charAt(0).toUpperCase() + page.uid.slice(1);

  let fullTitle: string;

  if (isHome && !metaTitle && siteName) {
    fullTitle = siteName;
  } else if (siteName) {
    // Pipe i metaTitle = kunden har selv styret sin branding — lad den stå.
    if (metaTitle?.includes("|")) {
      fullTitle = metaTitle;
    } else {
      fullTitle = `${pageLabel} | ${siteName}`;
    }
  } else {
    fullTitle = pageLabel;
  }
  const canonical_path = resolve_page_url(page.id, lang, tree, tenant);
  const full_canonical_url = `${base_url}${canonical_path}`;

  // Alternate Languages (hreflang)
  // Kun relevant når siden reelt findes på flere sprog. En enkeltsproget
  // tenant, eller en side der kun er publiceret på ét sprog, skal ikke
  // have hreflang — det er støj der forvirrer Google.
  // Vi inkluderer den aktuelle side som en syntetisk "translation" så map'en
  // indeholder alle sprog-versioner i én operation.
  const all_translations = [
    { id: page.id, uid: page.uid, lang },
    ...page.alternate_languages,
  ];
  const translation_urls = build_translation_url_map(
    all_translations,
    tree,
    tenant,
    base_url,
  );

  let alternate_langs: Record<string, string> | undefined;
  if (Object.keys(translation_urls).length > 1) {
    alternate_langs = translation_urls;
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

  const is_staging = is_staging_domain(hostname);

  return {
    title: fullTitle,
    description: page.data.meta_description,

    alternates: {
      canonical: full_canonical_url,
      languages: alternate_langs,
    },

    robots: is_staging
      ? { index: false, follow: false }
      : { index: true, follow: true },

    openGraph: {
      title: fullTitle,
      description: page.data.meta_description ?? undefined,
      url: full_canonical_url,
      siteName: siteName ?? undefined,
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

    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: page.data.meta_description,
      ...(og_image_url && { images: [og_image_url] }),
    },
  };
}
