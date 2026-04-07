import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { get_tenant_config } from "@/src/lib/kv/tenants";

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "localhost:3000";

  const tenant = await get_tenant_config(hostname);
  if (!tenant) return NextResponse.next();

  // 1. Tjek manuelle Redirects (Vanity URLs som /sommer)
  const fuzzy_target = tenant.redirects[pathname];
  if (fuzzy_target) {
    return NextResponse.redirect(
      new URL(fuzzy_target.destination, request.url),
      fuzzy_target.type,
    );
  }

  // Find sproget fra URL'en (hvis det findes)
  const lower_pathname = pathname.toLowerCase();
  const locale_from_path = tenant.locales.find(
    (loc) =>
      lower_pathname === `/${loc}` || lower_pathname.startsWith(`/${loc}/`),
  );

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
      return NextResponse.redirect(new URL(new_path, request.url), 301);
    } else {
      // Skjult præfiks: Vi viser indholdet, men beholder den pæne URL (/kontakt)
      return NextResponse.rewrite(new URL(new_path, request.url), {
        request: { headers: request_headers },
      });
    }
  }

  // 3. SCENARIE: SPROGET ER I URL'EN (f.eks. /da-dk/kontakt)

  // LOGIK-TJEK: Skal vi rydde op i URL'en?
  // Hvis det er standard-sproget (da-dk), og Jens IKKE vil have præfiks (false)
  if (locale_from_path === tenant.default_locale && !tenant.force_lang_prefix) {
    const clean_path = pathname.replace(`/${locale_from_path}`, "") || "/";
    // 301 Redirect: Vi rydder op og sender dem fra /da-dk/kontakt -> /kontakt
    return NextResponse.redirect(new URL(clean_path, request.url), 301);
  }

  // Ellers: Alt er som det skal være (f.eks. det er en /en-eu/ side eller force er true)
  request_headers.set("x-evi-locale", locale_from_path);

  // Send requestet videre med den nye header i bagagen
  return NextResponse.next({
    request: { headers: request_headers },
  });
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
