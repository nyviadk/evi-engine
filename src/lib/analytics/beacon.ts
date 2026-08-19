import { getCloudflareContext } from "@opennextjs/cloudflare";
import { get_tenant_config } from "@/src/lib/kv/tenants";
import { validate_hostname } from "@/src/lib/utils/security";
import { is_bot } from "./derive";
import { write_pageview } from "./pageview";

// Modtager EviBeacon'ens POST ved interne soft-navigationer (klik på <Link>),
// som serveren ikke kan tælle pålideligt. First-party + same-origin, så
// ad-blockers stort set ikke rører den. Skriver ét datapoint direkte til
// Analytics Engine (ingen ekstern proxy — Next-app'en ER Workeren). Svarer
// altid 204; en fejl må aldrig mærkes af brugeren.
export async function handle_beacon(request: Request): Promise<Response> {
  try {
    if (process.env.NODE_ENV === "development") return no_content();

    const ua = request.headers.get("user-agent") ?? "";
    if (is_bot(ua)) return no_content();

    const body = (await request.json()) as {
      p?: unknown;
      from?: unknown;
      l?: unknown;
    };
    const path = typeof body.p === "string" ? body.p : "";
    const from = typeof body.from === "string" ? body.from : "";
    const locale = typeof body.l === "string" ? body.l : "";
    if (!path.startsWith("/") || path.length > 512) return no_content();

    const hostname = validate_hostname(request.headers.get("host") ?? "");
    if (!hostname) return no_content();
    const tenant = await get_tenant_config(hostname);
    if (!tenant) return no_content();

    const cf = await getCloudflareContext({ async: true });
    if (!cf?.env?.EVI_STATS) return no_content();
    const country = cf.cf?.country ?? request.headers.get("cf-ipcountry") ?? "";

    // Soft-nav = intern navigation: ekstern referrer er tom; from_path er
    // klientens FORRIGE sti (Referer peger på den nye side, så den kan ikke bruges).
    const from_path =
      from.startsWith("/") && from.length <= 512 ? from.toLowerCase() : "";

    cf.ctx.waitUntil(
      write_pageview(
        cf.env,
        {
          repo: tenant.repo,
          hostname,
          path: path.toLowerCase(),
          locale,
          referrer_host: "",
          from_path,
          country,
          ip: request.headers.get("cf-connecting-ip") ?? "",
          ua,
        },
        Date.now(),
      ),
    );
  } catch {
    // Ignorér — beaconen er best-effort.
  }
  return no_content();
}

function no_content(): Response {
  return new Response(null, { status: 204 });
}
