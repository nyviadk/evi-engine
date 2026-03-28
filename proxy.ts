import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { get_tenant_config } from "@/src/lib/tenants";

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
    // Vi tvinger localematcher til at bruge små bogstaver
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

  const fuzzy_target = tenant.redirects[pathname];
  if (fuzzy_target) {
    return NextResponse.redirect(new URL(fuzzy_target, request.url), 307);
  }

  //  Vi gør pathname til små bogstaver, før vi tjekker sproget
  const lower_pathname = pathname.toLowerCase();
  const locale_from_path = tenant.locales.find(
    (loc) =>
      lower_pathname === `/${loc}` || lower_pathname.startsWith(`/${loc}/`),
  );

  // 1. Vi klargør en NY header-liste, som vi sender IND til serveren (not-found.tsx)
  const request_headers = new Headers(request.headers);

  // 2. Hvis sproget MANGLER i URL'en
  if (!locale_from_path) {
    const target_locale = get_browser_locale(
      request,
      tenant.locales,
      tenant.default_locale,
    );
    const new_path = `/${target_locale}${pathname === "/" ? "" : pathname}`;

    // Fortæl Next.js hvilket sprog vi har valgt at bruge
    request_headers.set("x-evi-locale", target_locale);

    if (tenant.force_lang_prefix) {
      return NextResponse.redirect(new URL(new_path, request.url));
    } else {
      // Husk at sende vores nye headers med i Rewritet!
      return NextResponse.rewrite(new URL(new_path, request.url), {
        request: { headers: request_headers },
      });
    }
  }

  // 3. Hvis sproget ER i URL'en (f.eks. /en-eu/noget)
  // Sæt headeren, så not-found.tsx kan læse "en-eu"
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
     */
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sitemap.xml|robots.txt|\\..*|.*\\..*).*)",
  ],
};
