import {
  createClient as baseCreateClient,
  type ClientConfig,
  type Route,
} from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";

// Vi opsætter dine Evi-ruter (Den Reusable Type vi lavede før!)
const routes: Route[] = [
  { type: "page", uid: "home", path: "/" },
  { type: "page", path: "/:uid" },
];

/**
 * Den dynamiske SaaS-klient!
 * Denne funktion kaldes i din Next.js page.tsx, HVER GANG en side loades.
 * @param repository_name - Kundens specifikke Prismic repo (f.eks. 'evi-jens-test')
 */
export const createTenantClient = (
  repository_name: string,
  config: ClientConfig = {},
) => {
  const client = baseCreateClient(repository_name, {
    routes,
    fetchOptions:
      process.env.NODE_ENV === "production"
        ? // Her er den afgørende forskel: Vi tagger Next.js cachen med KUNDENS navn!
          {
            next: { tags: [`prismic-${repository_name}`] },
            cache: "force-cache",
          }
        : { next: { revalidate: 5 } },
    ...config,
  });

  // Giver kunden lov til at bruge "Preview" knappen inde i Prismic
  enableAutoPreviews({ client });

  return client;
};
