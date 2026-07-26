import { type NextRequest } from "next/server";
import { redirectToPreviewURL } from "@prismicio/next";
import { get_tenant_config } from "@/src/lib/kv/tenants";
import { createTenantClient } from "@/prismicio";

export async function GET(
  request: NextRequest,
): Promise<Response | undefined> {
  const hostname = request.headers.get("host") || "localhost:3000";

  if (hostname === "nyvia.dk" || hostname === "www.nyvia.dk") {
    return;
  }

  const tenant = await get_tenant_config(hostname);

  if (!tenant) {
    return new Response("Kunde ikke fundet i Evi-motoren", { status: 404 });
  }

  const client = createTenantClient(tenant);

  return await redirectToPreviewURL({ client, request });
}
