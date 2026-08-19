import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verify_stats_token } from "./token";
import { query_stats } from "./query";
import { render_dashboard, render_message } from "./render";

const HTML_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "private, no-store",
  "x-robots-tag": "noindex, nofollow",
};

function page(html: string, status: number): NextResponse {
  return new NextResponse(html, { status, headers: HTML_HEADERS });
}

/**
 * Serverer stats-dashboardet for stats.nyvia.dk/<token>. Verificerer det
 * HMAC-signerede token, tjekker at versionen matcher den nuværende (KV, mangler
 * = 1) så roterede links dør, henter tal og render'er ren HTML. Alt guardet —
 * en fejl giver en pæn besked, aldrig et crash. Kaldes fra middleware.
 */
export async function handle_stats_request(
  request: Request,
): Promise<NextResponse> {
  const path = new URL(request.url).pathname;
  const token = decodeURIComponent(path.replace(/^\/+/, "").replace(/\/+$/, ""));

  try {
    const cf = await getCloudflareContext({ async: true });
    const secret = cf?.env?.EVI_STATS_SECRET;
    if (!secret) return page(render_message("Statistik er ikke sat op endnu."), 503);
    if (!token) return page(render_message("Mangler et gyldigt link."), 404);

    const verified = await verify_stats_token(secret, token);
    if (!verified) return page(render_message("Linket er ugyldigt."), 404);

    const raw = await cf.env.TENANTS?.get(`stats_ver:${verified.repo}`);
    const current = raw ? Number(raw) : 1;
    if (verified.version !== current) {
      return page(render_message("Linket er udløbet — bed om et nyt."), 404);
    }

    const data = await query_stats(verified.repo);
    return page(render_dashboard(verified.repo, data), 200);
  } catch {
    return page(render_message("Kunne ikke hente statistik lige nu."), 500);
  }
}
