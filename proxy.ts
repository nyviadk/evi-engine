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
    return match(languages, locales, default_locale);
  } catch (e) {
    return default_locale;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hostname = request.headers.get("host") || "localhost:3000";

  console.log("--- Middleware Debug ---");
  console.log("Pathname:", pathname);

  const tenant = await get_tenant_config(hostname);
  if (!tenant) {
    console.log("FEJL: Ingen tenant fundet for", hostname);
    return NextResponse.next();
  }

  // 1. Tjek redirects (lynhurtigt opslag i objektet)
  const fuzzy_target = tenant.redirects[pathname];
  if (fuzzy_target) {
    return NextResponse.redirect(new URL(fuzzy_target, request.url), 307);
  }

  // 2. Sprog-tjek
  const locale_from_path = tenant.locales.find(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`),
  );

  if (!locale_from_path) {
    const target_locale = get_browser_locale(
      request,
      tenant.locales,
      tenant.default_locale,
    );
    const new_path = `/${target_locale}${pathname === "/" ? "" : pathname}`;
    console.log("Omdirigerer/Rewriter til:", new_path); // <--- VIGTIG LOG

    if (tenant.force_lang_prefix) {
      return NextResponse.redirect(new URL(new_path, request.url));
    } else {
      return NextResponse.rewrite(new URL(new_path, request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set("x-evi-locale", locale_from_path);
  return response;
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
