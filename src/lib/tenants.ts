export interface TenantConfig {
  repo: string;
  locales: string[];
  default_locale: string;
  force_lang_prefix: boolean;
  redirects: Record<string, string>; // Hurtigt opslag: { "/fra": "/til" }
}

const mock_kv_data: Record<string, TenantConfig> = {
  "localhost:3000": {
    repo: "evi-engine",
    locales: ["da-dk", "en-gb"],
    default_locale: "da-dk",
    force_lang_prefix: false,
    redirects: {
      "/sommer": "/kampagner/sommer-2026",
      "/booking": "https://planway.com/jens",
    },
  },
};

export async function get_tenant_config(
  hostname: string,
): Promise<TenantConfig | null> {
  // Simulerer lynhurtigt opslag (senere Cloudflare KV)
  return mock_kv_data[hostname] || null;
}
