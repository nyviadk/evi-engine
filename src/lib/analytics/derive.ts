// Rene helpers til pageview-opsamling — ingen Cloudflare-bindings, så de kan
// unit-testes uden Worker-runtime.

const DAY_MS = 86_400_000;

// Sec-Fetch-Dest: document = ægte top-level navigation (browser-garanteret, kan
// ikke forfalskes, baseline siden 2023). Prefetch/RSC/fetch har "empty", og
// rå-HTTP crawlere/scannere sender headeren slet ikke → alt det falder udenfor.
// Interne <Link>-klik (soft-navs) er også bare RSC-fetches og kan IKKE skelnes
// fra prefetch server-side (Next's prefetch-headere er dokumenteret upålidelige),
// så dem tæller vi ikke her — de kræver en client-beacon.
export function is_countable_navigation(request: Request): boolean {
  return request.headers.get("sec-fetch-dest") === "document";
}

// Bot Fight Mode er slået fra (kolliderer med Prismic-webhook) og cf.botManagement
// kræver betalt add-on → cf-bot-felter er upålidelige. UA-liste er vores eneste
// billige signal ud over den path-baserede scanner-404 i middleware.
const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|pinterest|slackbot|whatsapp|telegram|discord|headless|lighthouse|scan|monitor|feedfetcher|curl|wget|python-requests/i;

export function is_bot(ua: string): boolean {
  return ua === "" || BOT_UA.test(ua);
}

export function device_of(ua: string): "mobile" | "desktop" {
  return /mobi|android|iphone|ipad|ipod|windows phone/i.test(ua)
    ? "mobile"
    : "desktop";
}

// Same-origin referer → intern navigation (from_path, til aggregeret flow);
// ekstern → trafik-kilde (referrer_host); direkte besøg → begge tomme.
export function parse_referrer(
  referer: string | null,
  hostname: string,
): { referrer_host: string; from_path: string } {
  if (!referer) return { referrer_host: "", from_path: "" };
  try {
    const ref = new URL(referer);
    const ref_host = ref.host.replace(/^www\./, "");
    const cur_host = hostname.replace(/^www\./, "");
    return ref_host === cur_host
      ? { referrer_host: "", from_path: ref.pathname.toLowerCase() }
      : { referrer_host: ref_host, from_path: "" };
  } catch {
    return { referrer_host: "", from_path: "" };
  }
}

// Dagligt roterende hash, udledt af secret + UTC-dato: samme besøgende får
// samme id inden for ét døgn (unikke uden cookie), men kan ikke følges på tværs
// af dage. Rå IP gemmes aldrig — kun denne envejs-hash.
export async function visitor_hash(
  secret: string,
  repo: string,
  ip: string,
  ua: string,
  now: number,
): Promise<string> {
  const day = Math.floor(now / DAY_MS);
  const material = new TextEncoder().encode(`${secret}:${day}:${repo}:${ip}:${ua}`);
  const digest = await crypto.subtle.digest("SHA-256", material as BufferSource);
  let hex = "";
  for (const b of new Uint8Array(digest)) hex += b.toString(16).padStart(2, "0");
  return hex.slice(0, 32); // 128 bit er rigeligt til daglig dedup
}
