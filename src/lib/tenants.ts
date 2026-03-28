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
    locales: ["da-dk", "en-eu"],
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

/**
 * Bygger den korrekte Evi-URL baseret på kundens sprogindstillinger.
 */
export function build_evi_url(
  uid: string,
  lang: string,
  tenant: TenantConfig,
): string {
  const is_default = lang === tenant.default_locale;
  const base_path = uid === "home" ? "" : `/${uid}`;

  // Hvis det er standardsproget, og vi IKKE tvinger præfiks, så fjern sproget fra URL'en
  if (is_default && !tenant.force_lang_prefix) {
    return base_path === "" ? "/" : base_path;
  }

  // Ellers tilføj sproget (f.eks. /da-dk/kontakt)
  return `/${lang}${base_path}`;
}
