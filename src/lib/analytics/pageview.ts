import { getCloudflareContext } from "@opennextjs/cloudflare";
import { is_staging_domain } from "@/src/lib/seo/domains";
import {
  device_of,
  is_bot,
  is_countable_navigation,
  parse_referrer,
  visitor_hash,
} from "./derive";

// EVI_STATS_SECRET sættes via `wrangler secret put` (ikke i wrangler.jsonc), så
// cf-typegen kender den ikke — augmentér CloudflareEnv her. Valgfri: uden den
// tælles sidevisninger stadig, bare uden unikke besøgende.
declare global {
  interface CloudflareEnv {
    EVI_STATS_SECRET?: string;
  }
}

/**
 * Server-side pageview-opsamling (Evi Stats). Kaldes fra middleware for hvert
 * serveret side-request → ét datapoint i Analytics Engine (cookieless, ingen
 * client-JS, ingen cookie-banner). ALT er guardet, så analytics aldrig kan
 * vælte et request.
 *
 * Datamodel: index = repo (tenant, så flere domæner ruller op i ét tal); blobs =
 * hostname · kind(prod/staging) · path · referrer_host · from_path · country ·
 * device · visitor_hash · locale; double = 1. `path` er besøgtes rigtige URL
 * (sprog-versioner har hver deres sti); `locale` er en egen dimension til
 * breakdown/filter — også korrekt for default-sproget, hvor stien ingen prefix har.
 */

type PageviewInput = {
  repo: string;
  hostname: string;
  path: string;
  locale: string;
  status: number;
};

// Eksplicitte felter, så BÅDE middleware (hårde navs, referrer fra Referer) og
// beacon-endpointet (soft-navs, from_path fra klienten) skriver samme model.
export type PageviewWrite = {
  repo: string;
  hostname: string;
  path: string;
  locale: string;
  referrer_host: string;
  from_path: string;
  country: string;
  ip: string;
  ua: string;
};

export async function write_pageview(
  env: CloudflareEnv,
  w: PageviewWrite,
  now: number,
): Promise<void> {
  const dataset = env.EVI_STATS;
  if (!dataset) return;
  const secret = env.EVI_STATS_SECRET ?? "";
  const hash = secret ? await visitor_hash(secret, w.repo, w.ip, w.ua, now) : "";

  dataset.writeDataPoint({
    indexes: [w.repo],
    blobs: [
      w.hostname,
      is_staging_domain(w.hostname) ? "staging" : "prod",
      w.path,
      w.referrer_host,
      w.from_path,
      w.country,
      device_of(w.ua),
      hash,
      w.locale,
    ],
    doubles: [1],
  });
}

export async function record_pageview(
  request: Request,
  input: PageviewInput,
): Promise<void> {
  if (process.env.NODE_ENV === "development") return; // next dev: ingen Worker-runtime
  if (input.status >= 300) return; // ikke redirects
  if (request.method !== "GET") return;
  // Kun ægte hårde navigationer server-side. Soft-navs (interne <Link>-klik) er
  // RSC-fetches uden pålideligt prefetch-signal → dem tæller EviBeacon fra klienten.
  if (!is_countable_navigation(request)) return;
  if (is_bot(request.headers.get("user-agent") ?? "")) return;

  try {
    const cf = await getCloudflareContext({ async: true });
    if (!cf?.env?.EVI_STATS) return;
    const country = cf.cf?.country ?? request.headers.get("cf-ipcountry") ?? "";
    const { referrer_host, from_path } = parse_referrer(
      request.headers.get("referer"),
      input.hostname,
    );
    const p = write_pageview(
      cf.env,
      {
        repo: input.repo,
        hostname: input.hostname,
        path: input.path,
        locale: input.locale,
        referrer_host,
        from_path,
        country,
        ip: request.headers.get("cf-connecting-ip") ?? "",
        ua: request.headers.get("user-agent") ?? "",
      },
      Date.now(),
    );
    // waitUntil når tilgængelig (post-response), ellers await inline — begge
    // er billige (én SHA-256 + non-blocking writeDataPoint).
    if (typeof cf.ctx?.waitUntil === "function") {
      cf.ctx.waitUntil(p);
    } else {
      await p;
    }
  } catch {
    // Analytics må ALDRIG vælte et request.
  }
}
