import { headers } from "next/headers";
import { get_tenant_config } from "@/src/lib/tenants";
import { createTenantClient } from "@/prismicio";
// Senere importerer vi din rigtige Evi-layout/komponent

export default async function NotFound() {
  const headers_list = await headers();
  const domain = headers_list.get("host") || "localhost:3000";

  // Vi griber det sprog, som dørmanden (proxy.ts) fandt ud af gæsten skulle have
  const lang = headers_list.get("x-evi-locale") || "da-dk";

  const tenant = await get_tenant_config(domain);

  if (tenant) {
    const client = createTenantClient(tenant.repo);
    // Her kan vi hente en specifik 404-side fra Prismic, som Jens selv har skrevet!
    // const content = await client.getByUID("page", "404", { lang }).catch(() => null);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-900">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4 text-lg">Siden blev ikke fundet på {domain}</p>
      <p className="mt-2 text-sm text-slate-500">Sprog valgt: {lang}</p>
    </div>
  );
}
