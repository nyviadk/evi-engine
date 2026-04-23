import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { get_tenant_config } from "@/src/lib/kv/tenants";
import {
  create_response_with_hsts,
  create_secure_url,
} from "./src/lib/utils/security";

export const runtime = "experimental-edge";

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
    // Vi tvinger localematcher til at bruge små bogstaver for at undgå loops (f.eks. da-DK -> da-dk)
    return match(languages, locales, default_locale).toLowerCase();
  } catch (e) {
    return default_locale.toLowerCase();
  }
}
// --- HOVEDLOGIK ---

export async function middleware(request: NextRequest) {
  // Browseren sender æøå URL-encoded ("/%C3%A6blekage"), men i Prismic/KV
  // står de som læsbare tegn ("/æblekage"). Decode så lookups matcher.
  // try/catch fordi decodeURIComponent smider ved malformet input.
  const raw_pathname = request.nextUrl.pathname;
  let pathname: string;
  try {
    pathname = decodeURIComponent(raw_pathname);
  } catch {
    pathname = raw_pathname;
  }
  const hostname = request.headers.get("host") || "localhost:3000";

  // www → apex 301. Begge værter serverer samme indhold; uden denne
  // redirect splittes SEO-signaler mellem www.kunde.dk og kunde.dk.
  if (hostname.startsWith("www.")) {
    const apex = hostname.slice(4);
    const target = new URL(request.nextUrl);
    target.host = apex;
    target.protocol = "https:";
    return create_response_with_hsts(NextResponse.redirect(target, 301));
  }

  if (hostname === "nyvia.dk") {
    return NextResponse.next();
  }

  const tenant = await get_tenant_config(hostname);
  if (!tenant) return create_response_with_hsts(NextResponse.next());

  // 1. Tjek manuelle Redirects (Vanity URLs som /sommer)
  const fuzzy_target = tenant.redirects[pathname];
  if (fuzzy_target) {
    return create_response_with_hsts(
      NextResponse.redirect(
        create_secure_url(fuzzy_target.destination, request),
        fuzzy_target.type,
      ),
    );
  }

  // Find sproget fra URL'en (hvis det findes)
  const lower_pathname = pathname.toLowerCase();
  const locale_from_path = tenant.locales.find(
    (loc) =>
      lower_pathname === `/${loc}` || lower_pathname.startsWith(`/${loc}/`),
  );

  // Home må aldrig bo på /home — canonical er roden.
  // Kort-circuit: hvis URL'en ender på /home (med eller uden lang-prefix),
  // redirect til den korrekte rod i ÉT hop i stedet for at lade page.tsx gøre det.
  const path_without_locale = locale_from_path
    ? lower_pathname.replace(`/${locale_from_path}`, "") || "/"
    : lower_pathname;

  if (path_without_locale === "/home") {
    const needs_prefix =
      tenant.force_lang_prefix || locale_from_path !== tenant.default_locale;
    const target_locale = locale_from_path || tenant.default_locale;
    const clean_root = needs_prefix ? `/${target_locale}` : "/";
    return create_response_with_hsts(
      NextResponse.redirect(create_secure_url(clean_root, request), 301),
    );
  }

  const request_headers = new Headers(request.headers);

  // 2. SCENARIE: SPROGET MANGLER I URL'EN (f.eks. /kontakt)
  if (!locale_from_path) {
    const target_locale = get_browser_locale(
      request,
      tenant.locales,
      tenant.default_locale,
    );

    const new_path = `/${target_locale}${pathname === "/" ? "" : pathname}`;
    request_headers.set("x-evi-locale", target_locale);

    // Hvis Jens vil TVINGE sprogpræfiks (force_lang_prefix: true)
    if (tenant.force_lang_prefix) {
      // 301 Redirect: Vi sender dem fra /kontakt -> /da-dk/kontakt
      return create_response_with_hsts(
        NextResponse.redirect(create_secure_url(new_path, request), 301),
      );
    } else {
      // Skjult præfiks: Vi viser indholdet, men beholder den pæne URL (/kontakt)
      return create_response_with_hsts(
        NextResponse.rewrite(create_secure_url(new_path, request), {
          request: { headers: request_headers },
        }),
      );
    }
  }

  // 3. SCENARIE: SPROGET ER I URL'EN (f.eks. /da-dk/kontakt)

  // LOGIK-TJEK: Skal vi rydde op i URL'en?
  // Hvis det er standard-sproget (da-dk), og Jens IKKE vil have præfiks (false)
  if (locale_from_path === tenant.default_locale && !tenant.force_lang_prefix) {
    const clean_path = pathname.replace(`/${locale_from_path}`, "") || "/";
    // 301 Redirect: Vi rydder op og sender dem fra /da-dk/kontakt -> /kontakt
    return create_response_with_hsts(
      NextResponse.redirect(create_secure_url(clean_path, request), 301),
    );
  }

  // Ellers: Alt er som det skal være (f.eks. det er en /en-eu/ side eller force er true)
  request_headers.set("x-evi-locale", locale_from_path);

  // Send requestet videre med den nye header i bagagen
  return create_response_with_hsts(
    NextResponse.next({
      request: { headers: request_headers },
    }),
  );
}

export const config = {
  matcher: [
    /*
     * Match alt undtagen:
     * 1. System-mapper (api, _next, assets)
     * 2. Alle filer med punktum (favicon.ico, sitemap.xml)
     * 3. Særlige skjulte mapper/filer der starter med punktum (som .well-known)
     * 4. Slice-simulator
     */
    "/((?!api|_next/static|_next/image|assets|slice-simulator|favicon.ico|sitemap.xml|robots.txt|\\..*|.*\\..*).*)",
  ],
};
