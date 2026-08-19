import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { get_tenant_config, type TenantConfig } from "@/src/lib/kv/tenants";
import { record_pageview } from "@/src/lib/analytics/pageview";
import { handle_stats_request } from "@/src/lib/analytics/dashboard";
import {
  create_response_with_hsts,
  create_secure_url,
  validate_hostname,
} from "./src/lib/utils/security";

export const runtime = "experimental-edge";

// Bot-scannere prober for WordPress/PHP-huller. Vi kører intet af det → altid
// junk. Match → billigt 404 i middleware FØR tenant-lookup/render.
const BOT_SCANNER_PATH =
  /\.php\b|\.aspx?\b|\/wp-|\/cgi-bin|\/xmlrpc|\/vendor\/|\/\.(?:env|git)\b/i;

function get_browser_locale(
  request: NextRequest,
  locales: string[],
  default_locale: string,
): string {
  const headers = {
    "accept-language": request.headers.get("accept-language") || "",
  };
  const languages = new Negotiator({ headers }).languages();
  try {
    // Tving små bogstaver for at undgå loops (fx da-DK -> da-dk).
    return match(languages, locales, default_locale).toLowerCase();
  } catch {
    return default_locale.toLowerCase();
  }
}

// Browseren sender æøå URL-encoded ("/%C3%A6blekage"), men i Prismic/KV står de
// som læsbare tegn. Decode så lookups matcher; try/catch fordi decodeURIComponent
// smider ved malformet input.
function decode_pathname(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function reject_bot_scanner(pathname: string): NextResponse | null {
  return BOT_SCANNER_PATH.test(pathname)
    ? new NextResponse(null, { status: 404 })
    : null;
}

// www → apex 301. Begge værter serverer samme indhold; uden denne redirect
// splittes SEO-signaler mellem www.kunde.dk og kunde.dk.
function redirect_www_to_apex(
  hostname: string,
  request: NextRequest,
): NextResponse | null {
  if (!hostname.startsWith("www.")) return null;
  const target = new URL(request.nextUrl);
  target.host = hostname.slice(4);
  target.protocol = "https:";
  return create_response_with_hsts(NextResponse.redirect(target, 301));
}

// Manuelle vanity-redirects (fx /sommer → /kampagne), konfigureret pr. tenant.
function resolve_vanity_redirect(
  tenant: TenantConfig,
  pathname: string,
  request: NextRequest,
): NextResponse | null {
  const fuzzy_target = tenant.redirects[pathname];
  if (!fuzzy_target) return null;
  return create_response_with_hsts(
    NextResponse.redirect(
      create_secure_url(fuzzy_target.destination, request),
      fuzzy_target.type,
    ),
  );
}

// Home hører kun til roden — /home (med/uden lang-prefix) redirectes i ÉT hop.
// 308 (permanent, method-preserving) matcher page.tsx's permanentRedirect for
// SAMME regel — ret begge steder hvis reglen ændres (der er ingen test der
// fanger at de driver fra hinanden).
function redirect_home_to_root(
  tenant: TenantConfig,
  locale_from_path: string | undefined,
  path_without_locale: string,
  request: NextRequest,
): NextResponse | null {
  if (path_without_locale !== "/home") return null;
  const needs_prefix =
    tenant.force_lang_prefix || locale_from_path !== tenant.default_locale;
  const target_locale = locale_from_path || tenant.default_locale;
  const clean_root = needs_prefix ? `/${target_locale}` : "/";
  return create_response_with_hsts(
    NextResponse.redirect(create_secure_url(clean_root, request), 308),
  );
}

// Lokaliserings-routing: sæt x-evi-locale/x-evi-pathname og enten rewrite (sprog
// mangler i URL), rydder-op-redirect (default-locale uden prefix) eller passthrough.
// Returnerer BÅDE responsen og det resolved sprog (til analytics-dimensionen),
// så browser-forhandlet sprog logges korrekt — ikke bare gættet fra URL'en.
function apply_locale_routing(
  tenant: TenantConfig,
  pathname: string,
  locale_from_path: string | undefined,
  request: NextRequest,
): { response: NextResponse; locale: string } {
  const request_headers = new Headers(request.headers);

  // SCENARIE: sproget mangler i URL'en (fx /kontakt).
  if (!locale_from_path) {
    // force_lang_prefix: true → altid default_locale (deterministisk, bot-venligt);
    // false → browser-locale. Googlebot sender ofte en-US; default_locale
    // garanterer at siden findes i force-mode.
    const target_locale = tenant.force_lang_prefix
      ? tenant.default_locale
      : get_browser_locale(request, tenant.locales, tenant.default_locale);

    const new_path = `/${target_locale}${pathname === "/" ? "" : pathname}`;
    request_headers.set("x-evi-locale", target_locale);
    // x-evi-pathname: kanonisk sti med locale-prefix, brugt af server-komponenter
    // (fx sprog-selector). encodeURI så non-ASCII (æøå) er header-safe.
    request_headers.set("x-evi-pathname", encodeURI(new_path));

    // Rewrite (ikke redirect): bots får 200 OK direkte i stedet for 301 som
    // visse form-URL-validatorer afviser. Canonical-tag i generateMetadata
    // holder SEO korrekt. Vary sikrer at caches ikke serverer forkert sprog.
    const response = NextResponse.rewrite(
      create_secure_url(new_path, request),
      { request: { headers: request_headers } },
    );
    response.headers.set("Vary", "Accept-Language");
    return { response: create_response_with_hsts(response), locale: target_locale };
  }

  // SCENARIE: default-sproget står i URL'en men tenant vil ikke have prefix →
  // ryd op (/da-dk/kontakt → /kontakt).
  if (locale_from_path === tenant.default_locale && !tenant.force_lang_prefix) {
    const clean_path = pathname.replace(`/${locale_from_path}`, "") || "/";
    return {
      response: create_response_with_hsts(
        NextResponse.redirect(create_secure_url(clean_path, request), 301),
      ),
      locale: locale_from_path,
    };
  }

  // Ellers: URL'en er allerede korrekt (fx /en-eu/ eller force=true).
  request_headers.set("x-evi-locale", locale_from_path);
  request_headers.set("x-evi-pathname", encodeURI(pathname));
  return {
    response: create_response_with_hsts(
      NextResponse.next({ request: { headers: request_headers } }),
    ),
    locale: locale_from_path,
  };
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const pathname = decode_pathname(request.nextUrl.pathname);

  const bot = reject_bot_scanner(pathname);
  if (bot) return bot;

  // request.nextUrl.host er derived fra CF's routing (mere pålidelig end raw
  // Host-header). validate_hostname reject'er malformede/spoofede værdier.
  const raw_hostname =
    request.nextUrl.host || request.headers.get("host") || "";
  const hostname = validate_hostname(raw_hostname) || "localhost:3000";

  const www = redirect_www_to_apex(hostname, request);
  if (www) return www;

  if (hostname === "nyvia.dk") return NextResponse.next();
  // Stats-dashboard bor på sit eget host, uden om tenant/Prismic-pipelinen.
  if (hostname === "stats.nyvia.dk") return handle_stats_request(request);

  const tenant = await get_tenant_config(hostname);
  if (!tenant) return create_response_with_hsts(NextResponse.next());

  const vanity = resolve_vanity_redirect(tenant, pathname, request);
  if (vanity) return vanity;

  const lower_pathname = pathname.toLowerCase();
  const locale_from_path = tenant.locales.find(
    (loc) =>
      lower_pathname === `/${loc}` || lower_pathname.startsWith(`/${loc}/`),
  );
  const path_without_locale = locale_from_path
    ? lower_pathname.replace(`/${locale_from_path}`, "") || "/"
    : lower_pathname;

  const home = redirect_home_to_root(
    tenant,
    locale_from_path,
    path_without_locale,
    request,
  );
  if (home) return home;

  const { response, locale } = apply_locale_routing(
    tenant,
    pathname,
    locale_from_path,
    request,
  );
  // Evi Stats: tæl den serverede visning (fire-and-forget, aldrig blokerende).
  // path = besøgtes RIGTIGE URL (/kontakt vs /en-eu/kontakt — aldrig flettet);
  // locale = resolved sprog som egen dimension (korrekt også for default-sprog
  // uden prefix, hvor stien ikke afslører sproget).
  await record_pageview(request, {
    repo: tenant.repo,
    hostname,
    path: lower_pathname,
    locale,
    status: response.status,
  });
  return response;
}

export const config = {
  matcher: [
    /*
     * Match alt undtagen: system-mapper (api, _next, assets), slice-simulator,
     * .well-known, og filer med kendt statisk-endelse (css/js/billeder/fonts…).
     * Junk-endelser som .php/.env/.git ekskluderes IKKE med vilje — de falder
     * igennem til middleware, så BOT_SCANNER_PATH kan 404'e scannere billigt.
     */
    "/((?!api|_next/static|_next/image|assets|slice-simulator|slice-preview|favicon.ico|sitemap.xml|robots.txt|\\.well-known|.*\\.(?:css|js|mjs|map|json|xml|txt|ico|png|jpe?g|gif|svg|webp|avif|woff2?|ttf|otf|eot|pdf|mp4|webm|mp3|zip)$).*)",
  ],
};
