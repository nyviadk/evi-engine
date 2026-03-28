import { isFilled, type Client, type LinkResolverFunction } from "@prismicio/client";

// Kun de felter resolve_page_url faktisk bruger.
// TenantConfig opfylder dette (strukturel typing), men klient-kode
// behøver ikke sende hemmeligheder som prismic_token til browseren.
export type PathConfig = {
  default_locale: string;
  force_lang_prefix: boolean;
};

/**
 * Bygger et sti-træ for ALLE sider ved at følge parent_page-kæden.
 * Returnerer Map<doc_id, uid_segments[]>
 * F.eks. { "abc123" => ["om-os", "vores-historie", "kontakt"] }
 */
export async function build_page_tree(
  client: Client,
): Promise<Map<string, string[]>> {
  const pages = await client.getAllByType("page", {
    lang: "*",
    fetch: ["page.parent_page"],
  });

  // Indeksér alle sider efter deres unikke Prismic ID
  const by_id = new Map<string, (typeof pages)[number]>();
  for (const p of pages) by_id.set(p.id, p);

  const cache = new Map<string, string[]>();

  function resolve(id: string): string[] {
    if (cache.has(id)) return cache.get(id)!;

    const doc = by_id.get(id);
    if (!doc || !doc.uid) return [];

    // Sæt midlertidig værdi — beskytter mod cirkulære parent-referencer
    cache.set(id, [doc.uid]);

    if (
      isFilled.contentRelationship(doc.data.parent_page) &&
      doc.data.parent_page.id !== id
    ) {
      const parent_segments = resolve(doc.data.parent_page.id);
      if (parent_segments.length > 0) {
        const segments = [...parent_segments, doc.uid];
        cache.set(id, segments);
        return segments;
      }
    }

    return [doc.uid];
  }

  for (const p of pages) resolve(p.id);

  return cache;
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
