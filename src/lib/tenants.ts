export interface TenantConfig {
  repo: string;
  locales: string[];
  default_locale: string;
  force_lang_prefix: boolean;
  redirects: Record<string, { destination: string; type: 301 | 307 }>;

  prismic_token?: string; // Nødvendig for Preview af kladder
  resend_api_key?: string; // Til kontaktformularer (valgfri)
}

// Når data skal hentes fra Prismic, så brug kun master lang - ellers skal
// kunden oprette samme "settings" i forskellige sprog.

const mock_kv_data: Record<string, TenantConfig> = {
  "localhost:3000": {
    repo: "evi-engine",
    locales: ["da-dk", "en-eu"],
    default_locale: "da-dk",
    force_lang_prefix: false,
    redirects: {
      // 307: Midlertidig genvej (f.eks. til en flyer)
      "/sommer": { destination: "/kampagner/sommer-2026", type: 307 },
      // 301: Permanent flyttet (f.eks. en gammel slettet side)
      "/gamleside": { destination: "/kontakt", type: 301 },
      "/booking": { destination: "https://planway.com/jens", type: 307 },
    },
    // Husk at indsætte et rigtigt token her senere for at teste Previews!
    prismic_token: "dit_hemmelige_prismic_token_her",
  },

  // Vi tilføjer lige dit staging-domæne for at simulere virkeligheden!
  "jens.web.nyvia.dk": {
    repo: "evi-engine",
    locales: ["da-dk", "en-eu"],
    default_locale: "da-dk",
    force_lang_prefix: false,
    redirects: {},
    prismic_token: "dit_hemmelige_prismic_token_her",
  },
};

export async function get_tenant_config(
  hostname: string,
): Promise<TenantConfig | null> {
  // Simulerer lynhurtigt opslag (senere Cloudflare KV)
  return mock_kv_data[hostname] || null;
}
