import {
  createClient as baseCreateClient,
  type ClientConfig,
  type Route,
} from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import { type TenantConfig } from "@/src/lib/tenants";

/**
 * Evi's Rute-definitioner.
 * Vi bruger :lang? som valgfri parameter, så motoren både kan håndtere
 * den korte URL (/kontakt) og den lange URL (/da-dk/kontakt).
 */
const routes: Route[] = [
  { type: "page", uid: "home", path: "/:lang?" },
  {
    type: "page",
    resolvers: {
      parent: "parent_page",
      grandparent: "parent_page.parent_page",
    },
    path: "/:lang?/:grandparent?/:parent?/:uid",
  },
];

/**
 * Den "Smarte" SaaS-klient!
 * Send 'tenant' objektet ind, så sørger funktionen selv for
 * at finde repo-navn og indsætte det hemmelige accessToken (til Previews).
 */
export const createTenantClient = (
  tenant: TenantConfig,
  config: ClientConfig = {},
) => {
  const client = baseCreateClient(tenant.repo, {
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
  enableAutoPreviews({ client });

  return client;
};
