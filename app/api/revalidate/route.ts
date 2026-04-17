import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { sync_tenants_for_repo } from "@/src/lib/kv/sync";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const json_data = JSON.parse(body);

    // Prismic sender altid deres repo-navn i 'domain' feltet!
    const prismic_repo = json_data.domain;
    const prismic_secret = json_data.secret;

    // Vi henter vores globale webhook-kodeord fra .env filen
    const expected_secret = process.env.PRISMIC_WEBHOOK_SECRET;

    // 1. Tjek om kodeordet passer
    if (prismic_secret !== expected_secret) {
      return new NextResponse("Ugyldigt kodeord", { status: 401 });
    }

    // 2. Sikkerhed: Fik vi et repo-navn fra Prismic?
    if (!prismic_repo) {
      return new NextResponse("Mangler repo-navn", { status: 400 });
    }

    // 3. Sync Prismic-afledte tenant-felter ind i KV for alle hostnames der
    //    bruger dette repo. Hash-compare skipper no-op writes.
    const sync_summary = await sync_tenants_for_repo(prismic_repo);

    // 4. Ryd indholds-cachen for denne ene kunde (delt tag på tværs af alle
    //    hostnames der bruger samme repo — staging + prod invalideres samlet).
    revalidateTag(`prismic-${prismic_repo}`);

    console.log("[revalidate]", sync_summary);

    return NextResponse.json({
      revalidated: true,
      repo_cleared: prismic_repo,
      sync: sync_summary,
      time: Date.now(),
    });
  } catch (error) {
    console.error("[revalidate] error", error);
    return new NextResponse("Serverfejl", { status: 500 });
  }
}

export function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
