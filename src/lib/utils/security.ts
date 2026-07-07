import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. Bygger URL'en og tvinger HTTPS i produktion
export function create_secure_url(path: string, request: NextRequest) {
  const url = new URL(path, request.url);
  if (
    process.env.NODE_ENV === "production" ||
    request.headers.get("x-forwarded-proto") === "https"
  ) {
    url.protocol = "https:";
  }
  return url;
}

// 2. Sætter et sæt sikkerheds-headers på alle svar.
//
// HSTS: browser husker at bruge HTTPS.
// nosniff: browser stoler på Content-Type, gætter ikke selv (blokerer JS-eksekvering af upload'ede filer).
// Referrer-Policy: kun domænet sendes ved cross-origin navigation (bevarer bruger-privacy).
// CSP: whitelist af tilladte ressource-kilder — sidste forsvar mod XSS.
//   - `unsafe-inline` på script-src kræves af Next 16 RSC hydration (flight-data inline).
//   - Prismic-hosts allowlist'et fordi CMS-preview-toolbar loader fra dem.
//   - `frame-ancestors` tillader Prismic Page Builder at embedde slice-simulator.
export function create_response_with_hsts(response: NextResponse) {
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // `unsafe-eval` kræves KUN i development (Next.js RSC-devtools bruger eval()
  // til stack-trace reconstruction). Production build har ikke behov for det —
  // strictere CSP der.
  const script_src_dev =
    process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";

  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${script_src_dev} https://static.cdn.prismic.io https://*.prismic.io`,
      "style-src 'self' 'unsafe-inline' https://fonts.bunny.net",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.bunny.net",
      "connect-src 'self' https://*.prismic.io https://*.cdn.prismic.io",
      "frame-src 'self' https://*.prismic.io",
      "frame-ancestors 'self' https://*.prismic.io",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  );
  return response;
}

// 3. Validerer hostname-shape før vi bruger det som KV-lookup-nøgle.
// På Cloudflare Workers sætter CF's routing hostnames korrekt, men self-hosted
// setups (bag nginx e.l.) kan potentielt få malformede Host-headers hvis
// reverse-proxy'en er miskonfigureret. Vi accepterer kun ren domain[:port]-form
// og reject'er path-tegn, null bytes, injection-forsøg. Max 253 tegn = RFC 1035.
const HOSTNAME_PATTERN =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*(:[0-9]{1,5})?$/i;

export function validate_hostname(raw: string): string | null {
  if (!raw || raw.length > 253) return null;
  if (!HOSTNAME_PATTERN.test(raw)) return null;
  return raw.toLowerCase();
}
