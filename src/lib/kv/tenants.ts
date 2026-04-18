import { getCloudflareContext } from "@opennextjs/cloudflare";
import { normalize_hostname } from "./normalize";

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

// Dev-only fallback.
// I 'npm run preview' og prod læses altid fra rigtig KV.
const mock_kv_data: Record<string, TenantConfig> = {
  "localhost:3000": {
    repo: "evi-engine",
    locales: ["da-dk"],
    default_locale: "da-dk",
    force_lang_prefix: false,
    redirects: {},
    prismic_token: "dit_token",
    prismic_write_api_token: "",
    synced_hash: "",
  },
};

async function get_kv_binding(): Promise<KVNamespace | null> {
  // next dev har ingen Worker-runtime — getCloudflareContext er upålidelig der.
  // Hop direkte til mock-fallback i dev. 'npm run preview' og prod kører
  // begge i production mode og bruger rigtig KV.
  if (process.env.NODE_ENV === "development") {
    return null;
  }
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
  const key = normalize_hostname(hostname);
  const kv = await get_kv_binding();
  if (kv) {
    return kv.get<TenantConfig>(key, "json");
  }
  // Dev fallback
  return mock_kv_data[key] ?? null;
}

export async function put_tenant_config(
  hostname: string,
  config: TenantConfig,
): Promise<void> {
  const kv = await get_kv_binding();
  if (!kv) {
    throw new Error(
      "TENANTS KV binding missing — put_tenant_config virker kun i Worker/preview.",
    );
  }
  const key = normalize_hostname(hostname);
  const metadata: TenantMetadata = { repo: config.repo };
  await kv.put(key, JSON.stringify(config), { metadata });
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
    throw new Error(
      "TENANTS KV binding missing — find_hostnames_by_repo kaldes kun fra webhook i Worker.",
    );
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
