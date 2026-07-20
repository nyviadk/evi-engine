import { getCloudflareContext } from "@opennextjs/cloudflare";
import { normalize_hostname } from "./normalize";
import {
  decrypt_token,
  encrypt_token,
  import_master_key,
} from "@/src/lib/crypto/tokens";

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
    locales: ["da-dk", "en-eu"],
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

// CryptoKey caches pr. Worker-isolate: master-key skifter aldrig inden for et
// deployment, så vi springer BÅDE Secrets Store-hentningen OG importen over
// efter første kald (før var kun importen cached → binding.get() kørte hver gang).
let cached_master_key: CryptoKey | null = null;

async function get_master_key(): Promise<CryptoKey> {
  if (cached_master_key) return cached_master_key;
  const ctx = await getCloudflareContext({ async: true });
  const binding = ctx?.env?.TOKEN_MASTER_KEY;
  if (!binding) {
    throw new Error(
      "TOKEN_MASTER_KEY Secrets Store binding mangler — tjek wrangler.jsonc",
    );
  }
  const raw_b64 = await binding.get();
  cached_master_key = await import_master_key(raw_b64);
  return cached_master_key;
}

async function decrypt_tenant_tokens(
  stored: TenantConfig,
): Promise<TenantConfig> {
  const key = await get_master_key();
  return {
    ...stored,
    prismic_token: stored.prismic_token
      ? await decrypt_token(stored.prismic_token, key)
      : "",
    prismic_write_api_token: stored.prismic_write_api_token
      ? await decrypt_token(stored.prismic_write_api_token, key)
      : "",
  };
}

async function encrypt_tenant_tokens(
  plain: TenantConfig,
): Promise<TenantConfig> {
  const key = await get_master_key();
  return {
    ...plain,
    prismic_token: plain.prismic_token
      ? await encrypt_token(plain.prismic_token, key)
      : "",
    prismic_write_api_token: plain.prismic_write_api_token
      ? await encrypt_token(plain.prismic_write_api_token, key)
      : "",
  };
}

// Cacher den KRYPTEREDE KV-entry pr. isolate med kort TTL, så samme request's
// middleware + RSC (to separate execution-boundaries) ikke rammer KV to gange.
// Bevidst ciphertext, ikke plaintext — dekryptering sker stadig pr. kald, så
// tokens ikke ligger dekrypteret i module-scope. Config-ændringer (redirects,
// onboarding) er manuelle, så ~60s staleness er acceptabelt.
const TENANT_CACHE_TTL_MS = 60_000;
const tenant_raw_cache = new Map<
  string,
  { value: TenantConfig | null; expires: number }
>();

async function get_stored_config(
  kv: KVNamespace,
  key: string,
): Promise<TenantConfig | null> {
  const now = Date.now();
  const cached = tenant_raw_cache.get(key);
  if (cached && cached.expires > now) return cached.value;
  const stored = await kv.get<TenantConfig>(key, "json");
  tenant_raw_cache.set(key, { value: stored, expires: now + TENANT_CACHE_TTL_MS });
  return stored;
}

export async function get_tenant_config(
  hostname: string,
): Promise<TenantConfig | null> {
  const key = normalize_hostname(hostname);
  const kv = await get_kv_binding();
  if (kv) {
    const stored = await get_stored_config(kv, key);
    if (!stored) return null;
    // Tokens i KV er encrypted med AES-GCM (v1:iv:ct format). Dekryptér før
    // resten af app'en får dem — resten af koden ser altid plaintext.
    return decrypt_tenant_tokens(stored);
  }
  // Dev fallback — mock-data er plaintext (dev-only, ingen KV involveret).
  // Enhver localhost-port matcher dev-tenant'en, så `next dev` virker uanset
  // om Next hopper til 3001/3002 når 3000 er optaget (ellers 404 på `/` fordi
  // ruten aldrig får sit locale-prefix).
  if (mock_kv_data[key]) return mock_kv_data[key];
  if (key.startsWith("localhost")) return mock_kv_data["localhost:3000"] ?? null;
  return null;
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
  // Encrypt tokens før write — data-at-rest i KV er altid ciphertext.
  const encrypted = await encrypt_tenant_tokens(config);
  await kv.put(key, JSON.stringify(encrypted), { metadata });
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
