import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface TenantConfig {
  repo: string;
  locales: string[];
  default_locale: string;
  force_lang_prefix: boolean;
  redirects: Record<string, { destination: string; type: 301 | 307 }>;

  prismic_token: string; // Nødvendig for Preview af kladder
  prismic_write_api_token: string; // Nødvendig for sync af slices
  synced_hash: string; // til synkronisering med KV
}

export interface TenantMetadata {
  repo: string;
}

// Når global data skal hentes fra Prismic, så brug kun master lang - ellers skal
// kunden oprette samme "settings" og "business" i forskellige sprog.

export const mock_kv_data: Record<string, TenantConfig> = {
  "localhost:3000": {
    repo: "evi-engine",
    locales: ["da-dk", "en-eu"],
    default_locale: "da-dk",
    force_lang_prefix: true,
    redirects: {
      // 307: Midlertidig genvej (f.eks. til en flyer)
      "/sommer": { destination: "/kampagner/sommer-2026", type: 307 },
      // 301: Permanent flyttet (f.eks. en gammel slettet side)
      "/gamleside": { destination: "/kontakt", type: 301 },
      "/booking": { destination: "https://planway.com/jens", type: 307 },
    },
    // Husk at indsætte rigtige tokens her senere for at teste Previews og sync slices!
    prismic_token: "dit_hemmelige_prismic_token_her", // Content API fane
    prismic_write_api_token: "dit_hemmelige_prismic_write_token_her", // Write APIs fane
    synced_hash: "",
  },
  "127.0.0.1:8787": {
    repo: "evi-engine",
    locales: ["da-dk", "en-eu"],
    default_locale: "da-dk",
    force_lang_prefix: false,
    redirects: {},
    prismic_token: "dit_hemmelige_prismic_token_her",
    prismic_write_api_token: "dit_hemmelige_prismic_write_token_her",
    synced_hash: "",
  },

  // Vi tilføjer lige dit staging-domæne for at simulere virkeligheden!
  "jens.web.nyvia.dk": {
    repo: "evi-engine",
    locales: ["da-dk", "en-eu"],
    default_locale: "da-dk",
    force_lang_prefix: false,
    redirects: {},
    prismic_token: "dit_hemmelige_prismic_token_her",
    prismic_write_api_token: "dit_hemmelige_prismic_write_token_her",
    synced_hash: "",
  },
};

async function get_kv_binding(): Promise<KVNamespace | null> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    return ctx?.env?.TENANTS ?? null;
  } catch {
    return null;
  }
}

export async function get_tenant_config(
  hostname: string,
): Promise<TenantConfig | null> {
  const kv = await get_kv_binding();
  if (kv) {
    const value = await kv.get<TenantConfig>(hostname, "json");
    return value;
  }
  return mock_kv_data[hostname] ?? null;
}

export async function put_tenant_config(
  hostname: string,
  config: TenantConfig,
): Promise<void> {
  const kv = await get_kv_binding();
  if (!kv) {
    throw new Error(
      `put_tenant_config(${hostname}) called without TENANTS KV binding — only valid in deployed Worker or wrangler preview.`,
    );
  }
  const metadata: TenantMetadata = { repo: config.repo };
  await kv.put(hostname, JSON.stringify(config), { metadata });
}

/**
 * Find alle hostnames hvis TENANTS-entry har metadata.repo === repo.
 * Bruger list() med pagination (1000 keys per page) og filtrerer på
 * metadata — ingen ekstra get()-kald per key.
 *
 * Resultatet caches 5 min i Cloudflare Cache API, så publish-bursts
 * ikke trigger gentagne list-loops.
 */
export async function find_hostnames_by_repo(repo: string): Promise<string[]> {
  const kv = await get_kv_binding();
  if (!kv) {
    return Object.entries(mock_kv_data)
      .filter(([, cfg]) => cfg.repo === repo)
      .map(([host]) => host);
  }

  const cache_key = new Request(
    `https://internal.evi/repo-index/${encodeURIComponent(repo)}`,
  );
  const cache = await caches.open("tenants-repo-index");
  const cached = await cache.match(cache_key);
  if (cached) {
    return (await cached.json()) as string[];
  }

  const hostnames: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await kv.list<TenantMetadata>({ cursor });
    for (const key of page.keys) {
      if (key.metadata?.repo === repo) {
        hostnames.push(key.name);
      }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  await cache.put(
    cache_key,
    new Response(JSON.stringify(hostnames), {
      headers: { "cache-control": "max-age=300" },
    }),
  );

  return hostnames;
}
