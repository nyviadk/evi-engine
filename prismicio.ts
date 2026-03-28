import * as prismic from "@prismicio/client";
import * as prismicNext from "@prismicio/next";
import { type Route } from "@prismicio/client";
import { TenantConfig } from "./src/lib/tenants";

// Vi opsætter ruterne - bemærk :lang? så vi håndterer både /kontakt og /da-dk/kontakt
const routes: Route[] = [
  { type: "page", uid: "home", path: "/" },
  { type: "page", path: "/:uid" },
];

/**
 * Den "Smarte" SaaS-klient!
 * Nu sender vi hele 'tenant' objektet med ind.
 */
export const createTenantClient = (
  tenant: TenantConfig, // Vi tager hele kunden med i hånden
  config: prismicNext.CreateClientConfig = {},
) => {
  const client = prismic.createClient(tenant.repo, {
    routes,
    fetchOptions:
      process.env.NODE_ENV === "production"
        ? {
            next: { tags: [`prismic-${tenant.repo}`] },
            cache: "force-cache",
          }
        : { next: { revalidate: 5 } },
    // Her bruger vi tokenet fra din tenants.ts automatisk!
    accessToken: tenant.prismic_token,
    ...config,
  });

  // Aktiverer automatisk Preview (Drafts)
  prismicNext.enableAutoPreviews({ client });

  return client;
};
