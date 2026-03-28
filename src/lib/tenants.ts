export interface TenantConfig {
  repo: string;
  locales: string[];
  default_locale: string;
  force_lang_prefix: boolean;
  redirects: Record<string, { destination: string; type: 301 | 307 }>;

  prismic_token?: string; // Nødvendig for Preview af kladder
  resend_api_key?: string; // Til kontaktformularer (valgfri)
}

const mock_kv_data: Record<string, TenantConfig> = {
  "localhost:3000": {
    repo: "evi-engine.",
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
    repo: "evi-engine.",
    locales: ["da-dk", "en-eu"],
    default_locale: "da-dk",
    force_lang_prefix: false,
    redirects: {},
    prismic_token: "dit_hemmelige_prismic_token_her",
  },
};

// ... resten af filen (get_tenant_config og build_evi_url) forbliver det samme

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
