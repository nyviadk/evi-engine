import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

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

    // 3. Magien: Vi rydder KUN cachen for denne ene kunde!
    revalidateTag(`prismic-${prismic_repo}`, "max");

    return NextResponse.json({
      revalidated: true,
      repo_cleared: prismic_repo,
      time: Date.now(),
    });
  } catch (error) {
    return new NextResponse("Serverfejl", { status: 500 });
  }
}
