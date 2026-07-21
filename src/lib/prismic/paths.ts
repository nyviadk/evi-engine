import {
  isFilled,
  type LinkResolverFunction,
  type PrismicDocument,
} from "@prismicio/client";

// Kun de felter resolve_page_url faktisk bruger.
// TenantConfig opfylder dette (strukturel typing), men klient-kode
// behøver ikke sende hemmeligheder som prismic_token til browseren.
export type PathConfig = {
  default_locale: string;
  force_lang_prefix: boolean;
};

/**
 * Delt parent_page-kæde-traversering for BÅDE sti-træet og breadcrumb-trails:
 * samme rekursion (memoiseret + cyklus-beskyttet, home = rod), kun "enheden" pr.
 * doc og home-tilfældet varierer. `make_unit` bygger enheden; `home_chain` afgør
 * hvad home opløser til (træet: sig selv som eneste segment; breadcrumbs: tom, da
 * home ikke har en krumme). Docs SKAL indeholde `parent_page`.
 */
function build_parent_chains<T>(
  pages: readonly PrismicDocument[],
  make_unit: (doc: PrismicDocument, uid: string) => T,
  home_chain: (unit: T) => T[],
): Map<string, T[]> {
  const by_id = new Map<string, PrismicDocument>();
  for (const p of pages) by_id.set(p.id, p);

  const cache = new Map<string, T[]>();

  function resolve(id: string): T[] {
    const cached = cache.get(id);
    if (cached) return cached;

    const doc = by_id.get(id);
    if (!doc || !doc.uid) return [];

    const unit = make_unit(doc, doc.uid);
    // Midlertidig værdi — beskytter mod cirkulære parent-referencer.
    cache.set(id, [unit]);

    // Home er altid roden — ignorér enhver parent_page editoren måtte have sat.
    if (doc.uid === "home") {
      const chain = home_chain(unit);
      cache.set(id, chain);
      return chain;
    }

    if (
      isFilled.contentRelationship(doc.data.parent_page) &&
      doc.data.parent_page.id !== id
    ) {
      const parent_doc = by_id.get(doc.data.parent_page.id);
      // Home må aldrig optræde som forælder — det ville give /home/<child> stier.
      if (parent_doc && parent_doc.uid !== "home") {
        const parent_chain = resolve(doc.data.parent_page.id);
        if (parent_chain.length > 0) {
          const chain = [...parent_chain, unit];
          cache.set(id, chain);
          return chain;
        }
      }
    }

    return [unit];
  }

  for (const p of pages) resolve(p.id);
  return cache;
}

/**
 * Sti-træ (Map<doc_id, uid_segments[]>) fra ALLE side-docs via parent_page-kæden.
 * Adskilt fra fetchen så en caller der ALLEREDE har hentet siderne (fx sitemap,
 * med et superset af felter) kan bygge træet uden et ekstra getAllByType-kald.
 */
export function build_tree_from_docs(
  pages: readonly PrismicDocument[],
): Map<string, string[]> {
  return build_parent_chains(
    pages,
    (_doc, uid) => uid,
    (uid) => [uid],
  );
}

export type BreadcrumbCrumb = { id: string; uid: string; title: string };

// Rigtig sidetitel (meta_title) med fallback til stor-forbogstav-uid — samme
// fallback som generateMetadata, så breadcrumbs og <title> matcher.
function doc_display_title(doc: PrismicDocument): string {
  const meta = (doc.data as Record<string, unknown>).meta_title;
  if (typeof meta === "string" && meta.trim()) return meta;
  const uid = doc.uid ?? "";
  return uid ? uid.charAt(0).toUpperCase() + uid.slice(1) : "";
}

/**
 * Breadcrumb-sti (rod→blad, ekskl. home) pr. doc-id, med RIGTIGE titler.
 * Kræver docs med `parent_page` + `meta_title`. Bygges fra samme docs som
 * sti-træet, så titlerne bæres hele vejen — ikke gættet fra URL-slugs.
 */
export function build_breadcrumb_trails(
  pages: readonly PrismicDocument[],
): Map<string, BreadcrumbCrumb[]> {
  return build_parent_chains(
    pages,
    (doc, uid) => ({ id: doc.id, uid, title: doc_display_title(doc) }),
    () => [], // home har ingen breadcrumb-krumme
  );
}

/**
 * Opløser den fulde URL-sti for et dokument baseret på sti-træet.
 * Håndterer sprog-præfiks og home-side logik via tenant-config.
 */
export function resolve_page_url(
  doc_id: string,
  lang: string,
  tree: Map<string, string[]>,
  config: PathConfig,
): string {
  const segments = tree.get(doc_id);
  if (!segments || segments.length === 0) return "/";

  const is_home = segments.length === 1 && segments[0] === "home";
  const base_path = is_home ? "" : `/${segments.join("/")}`;
  const is_default = lang === config.default_locale;

  if (is_default && !config.force_lang_prefix) {
    return base_path === "" ? "/" : base_path;
  }

  return `/${lang}${base_path}`;
}

/**
 * Bygger en `locale -> URL`-map fra et sæt Prismic translation-lignende
 * entries (alternate_languages-items eller sitemap-page-docs). Entries der
 * mangler `id`, `lang` eller `uid` springes over — resolve_page_url har
 * brug for alle tre for at slå den hierarkiske sti op i sti-træet.
 *
 * `base_url` prepender fuld origin ("https://kunde.com") til absolute URLs.
 * Udelad for relative stier (in-app language selector).
 *
 * Bruges af:
 *  - app/sitemap.ts — sitemap-alternates per side-gruppe
 *  - app/[lang]/[[...uid]]/page.tsx generateMetadata — hreflang links
 *  - app/[lang]/layout.tsx — LanguageSelector URLs
 */
export function build_translation_url_map(
  translations: readonly {
    id?: string | null;
    lang?: string | null;
    uid?: string | null;
  }[],
  tree: Map<string, string[]>,
  config: PathConfig,
  base_url?: string,
): Record<string, string> {
  const urls: Record<string, string> = {};
  for (const t of translations) {
    if (t.uid && t.id && t.lang) {
      const path = resolve_page_url(t.id, t.lang, tree, config);
      urls[t.lang] = base_url ? `${base_url}${path}` : path;
    }
  }
  return urls;
}

/**
 * Opretter en linkResolver-funktion baseret på sti-træet.
 * Kan bruges direkte i PrismicNextLink og PrismicRichText som server-prop.
 */
export function create_link_resolver(
  tree: Map<string, string[]>,
  config: PathConfig,
): LinkResolverFunction {
  return (doc) => {
    if (!doc.id) return null;
    return resolve_page_url(doc.id, doc.lang, tree, config);
  };
}
