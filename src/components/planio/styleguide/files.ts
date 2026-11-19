import { zipSync } from "fflate";

import { get_evi_context, type EviContext } from "@/src/lib/prismic/context";
import {
  dark_background_logo,
  is_planio_tenant,
  planio_brand,
  planio_partner_logos,
  STYLEGUIDE_FILES,
  type PlanioBrand,
} from "@/src/components/planio/styleguide/brand";
import { build_manifest } from "@/src/components/planio/styleguide/manifest";

// Kort cache: filerne følger Prismic, så en ny farve eller et nyt logo slår
// igennem inden for få minutter.
const CACHE = "public, max-age=300";

const not_found = () => new Response("Not found", { status: 404 });

async function fetch_text(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

async function logo_sources(brand: PlanioBrand) {
  const light = await fetch_text(brand.logoUrl);
  return { light, dark: light && dark_background_logo(light, brand.colors) };
}

function svg_response(svg: string | null, filename: string): Response {
  if (!svg) return not_found();
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": CACHE,
      // SVG'en serveres fra vores eget domæne: intet script må køre, hvis den åbnes direkte.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function app_icon_response(brand: PlanioBrand): Promise<Response> {
  if (!brand.appIcon) return not_found();
  const res = await fetch(`${brand.appIcon.url}?fm=png`).catch(() => null);
  if (!res?.ok) return not_found();
  return new Response(res.body, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="${STYLEGUIDE_FILES.appIcon}"`,
      "Cache-Control": CACHE,
    },
  });
}

async function partner_zip(ctx: EviContext): Promise<Response> {
  const logos = await planio_partner_logos(ctx);
  const files = await Promise.all(
    logos.map(async (logo) => {
      const res = await fetch(logo.downloadUrl).catch(() => null);
      if (!res?.ok) return null;
      return [logo.downloadName, new Uint8Array(await res.arrayBuffer())] as const;
    }),
  );
  // Billederne er komprimerede i forvejen, så de lægges i zippen, som de er.
  const zip = zipSync(Object.fromEntries(files.filter((f) => f !== null)), { level: 0 });
  return new Response(zip as Uint8Array<ArrayBuffer>, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="my-planio-eksterne-logoer.zip"`,
      "Cache-Control": CACHE,
    },
  });
}

async function manifest_response(ctx: EviContext, brand: PlanioBrand): Promise<Response> {
  const [logos, partners] = await Promise.all([
    logo_sources(brand),
    planio_partner_logos(ctx),
  ]);
  return Response.json(build_manifest(ctx, brand, logos, partners), {
    headers: {
      // Eksterne værktøjer skal kunne hente det fra en anden side.
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": CACHE,
    },
  });
}

/** Filerne under /styleguide/. Findes kun på My Planio. */
export async function planio_styleguide_file(file: string): Promise<Response> {
  const ctx = await get_evi_context();
  if (!ctx || !is_planio_tenant(ctx.tenant)) return not_found();
  const brand = planio_brand(ctx);

  switch (file) {
    case STYLEGUIDE_FILES.manifest:
      return manifest_response(ctx, brand);
    case STYLEGUIDE_FILES.partnerZip:
      return partner_zip(ctx);
    case STYLEGUIDE_FILES.logoLight:
      return svg_response(await fetch_text(brand.logoUrl), file);
    case STYLEGUIDE_FILES.logoDark:
      return svg_response((await logo_sources(brand)).dark, file);
    case STYLEGUIDE_FILES.appIcon:
      return app_icon_response(brand);
    default:
      return not_found();
  }
}
