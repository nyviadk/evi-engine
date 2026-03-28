import { NextRequest } from "next/server";
import { redirectToPreviewURL } from "@prismicio/next";
import { get_tenant_config } from "@/src/lib/tenants";
import { createTenantClient } from "@/prismicio";

export async function GET(request: NextRequest) {
  // 1. Aflæs domænet (f.eks. jens.web.nyvia.dk)
  const hostname = request.headers.get("host") || "localhost:3000";

  // 2. Slå kunden op i vores lommebog
  const tenant = await get_tenant_config(hostname);

  if (!tenant) {
    return new Response("Kunde ikke fundet i Evi-motoren", { status: 404 });
  }

  // 3. Opret en Prismic-klient specifikt til Jens' repo
  const client = createTenantClient(tenant);

  // 4. Lad Prismic aktivere "Draft Mode" og sende Jens til den rigtige side
  return await redirectToPreviewURL({ client, request });
}
