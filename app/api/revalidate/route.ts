import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { sync_tenants_for_repo } from "@/src/lib/kv/sync";

export const dynamic = "force-dynamic";

/**
 * Konstant-tids sammenligning af to strings via crypto.subtle.timingSafeEqual.
 * Standard `!==` afslører længden og første forskellige byte via timing —
 * en angriber kan brute-force kodeordet tegn for tegn. Vi sammenligner altid
 * buffers af samme længde og maskerer længdeforskellen via XOR.
 */
async function timing_safe_equal(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const a_bytes = encoder.encode(a);
  const b_bytes = encoder.encode(b);

  // Hvis længderne er forskellige, sammenlign stadig mod en buffer af samme
  // længde (men markér som mismatch). Forhindrer timing-læk af længden.
  const len = Math.max(a_bytes.length, b_bytes.length);
  const a_pad = new Uint8Array(len);
  const b_pad = new Uint8Array(len);
  a_pad.set(a_bytes);
  b_pad.set(b_bytes);

  let diff = a_bytes.length ^ b_bytes.length;
  for (let i = 0; i < len; i++) {
    diff |= a_pad[i] ^ b_pad[i];
  }
  return diff === 0;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const json_data = JSON.parse(body);

    // Prismic sender altid deres repo-navn i 'domain' feltet!
    const prismic_repo = json_data.domain;
    const prismic_secret = json_data.secret;

    // Vi henter vores globale webhook-kodeord fra .env filen
    const expected_secret = process.env.PRISMIC_WEBHOOK_SECRET;

    // 1. Tjek om kodeordet passer (timing-safe compare)
    if (
      !expected_secret ||
      typeof prismic_secret !== "string" ||
      !(await timing_safe_equal(prismic_secret, expected_secret))
    ) {
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
