import { headers } from "next/headers";
import { get_tenant_config } from "@/src/lib/kv/tenants";

export default async function NotFound() {
  const headers_list = await headers();
  const domain = headers_list.get("host") || "localhost:3000";

  // Vi griber det sprog, som dørmanden (proxy.ts) fandt ud af gæsten skulle have
  const lang = headers_list.get("x-evi-locale") || "da-dk";

  // Tenant slås op så vi kan hente en dedikeret 404-side fra Prismic når den kommer.
  // Pt. har vi ingen Prismic 404 — senere: client.getByUID("page", "404", { lang })
  await get_tenant_config(domain);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-900">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4 text-lg">Siden blev ikke fundet på {domain}</p>
      <p className="mt-2 text-sm text-slate-500">Sprog valgt: {lang}</p>
    </div>
  );
}
