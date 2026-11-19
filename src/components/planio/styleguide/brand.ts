import {
  asImageSrc,
  isFilled,
  type ImageField,
  type ImageFieldImage,
} from "@prismicio/client";

import { SLICE_PREFIXES } from "@/scripts/slice-prefixes";
import type { TenantConfig } from "@/src/lib/kv/tenants";
import { get_evi_all_pages, type EviContext } from "@/src/lib/prismic/context";
import { DEFAULTS_COLORS } from "@/src/lib/theme/colors";
import { RADIUS_MAP } from "@/src/lib/theme/radius";
import type { BrandColors } from "@/src/components/planio/styleguide/tokens";

/** Designguiden findes kun på My Planio og står hverken i Prismic eller sitemappet. */
export function is_planio_tenant(tenant: TenantConfig): boolean {
  return tenant.repo === SLICE_PREFIXES.planio_;
}

export const STYLEGUIDE_PATH = "/styleguide";

/** Faste adresser under /styleguide/, så et link, man har delt, bliver ved med at virke. */
export const STYLEGUIDE_FILES = {
  manifest: "manifest.json",
  partnerZip: "eksterne-logoer.zip",
  logoLight: "my-planio-logo-lys-baggrund.svg",
  logoDark: "my-planio-logo-moerk-baggrund.svg",
  appIcon: "my-planio-app-ikon.png",
} as const;

export type StyleguideFile = (typeof STYLEGUIDE_FILES)[keyof typeof STYLEGUIDE_FILES];

export const styleguide_file_path = (file: StyleguideFile): string =>
  `${STYLEGUIDE_PATH}/${file}`;

export type PlanioBrand = {
  siteName: string;
  colors: BrandColors;
  font: string;
  /** Hjørneradius som CSS-værdi, fx "1rem". */
  radius: string;
  /** Ordmærket til lys baggrund (SVG) fra footerens logo. */
  logoUrl: string | null;
  /** App-ikonet i fuld størrelse (settings.favicon_light); size = originalens bredde i px. */
  appIcon: { url: string; size: number | null } | null;
};

/** Selve filen uden Prismics beskæring og skalering. */
function original_url(image: ImageFieldImage<"filled">): string {
  const url = new URL(image.url);
  url.search = "";
  return url.toString();
}

/**
 * Originalens bredde. Prismic oplyser kun beskæringens mål (zoom er altid 1 i
 * leverings-API'et), så imgix spørges. Filen skifter aldrig under samme adresse.
 */
async function original_width(url: string): Promise<number | null> {
  try {
    const res = await fetch(`${url}?fm=json`, { cache: "force-cache" });
    if (!res.ok) return null;
    const meta = (await res.json()) as { PixelWidth?: number };
    return typeof meta.PixelWidth === "number" ? meta.PixelWidth : null;
  } catch {
    return null;
  }
}

async function app_icon(field: ImageField | undefined): Promise<PlanioBrand["appIcon"]> {
  if (!isFilled.image(field)) return null;
  const url = original_url(field);
  return { url, size: await original_width(url) };
}

export async function planio_brand(ctx: EviContext): Promise<PlanioBrand> {
  const s = ctx.settings?.data;
  const logo = ctx.footer?.data?.logo;
  return {
    siteName: s?.site_name || "My Planio",
    colors: {
      light: s?.color_light || DEFAULTS_COLORS.color_light,
      dark: s?.color_dark || DEFAULTS_COLORS.color_dark,
      primary: s?.color_primary || DEFAULTS_COLORS.color_primary,
      secondary: s?.color_secondary || s?.color_primary || DEFAULTS_COLORS.color_secondary,
    },
    font: s?.font_select || "Comfortaa",
    radius: RADIUS_MAP[s?.border_radius ?? ""] ?? "0.5rem",
    logoUrl: isFilled.image(logo) ? original_url(logo) : null,
    appIcon: await app_icon(s?.favicon_light),
  };
}

/**
 * Logoet til mørk baggrund: samme fil og samme viewBox som det lyse, så de fylder
 * lige meget. Kun stierne (ordmærket MY og forbindelseslinjerne) skifter fra den
 * mørke til den lyse farve; telefonens skærm har sine streger som rect/line og
 * forbliver mørk.
 */
export function dark_background_logo(svg: string, colors: BrandColors): string {
  const dark = new RegExp(colors.dark.replace("#", "#?"), "gi");
  return svg.replace(/<path\b[^>]*>/g, (tag) => tag.replace(dark, colors.light));
}

export function absolute_url(ctx: EviContext, path: string): string {
  const protocol = ctx.hostname.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${ctx.hostname}${path}`;
}

export type PartnerLogo = {
  /** Prismic-billedets id; samme logo kan stå flere steder. */
  id: string;
  name: string;
  format: "SVG" | "PNG";
  previewUrl: string;
  /** Prismic-adressen, der sender filen som download. */
  downloadUrl: string;
  downloadName: string;
  width: number;
  height: number;
};

// Stort nok til print og slides; Innovationsfondens original er 7838 px bred.
const PARTNER_MAX_WIDTH = 2400;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function partner_logo(image: ImageFieldImage<"filled">, name: string): PartnerLogo {
  const is_svg = new URL(image.url).pathname.toLowerCase().endsWith(".svg");
  const format = is_svg ? "SVG" : "PNG";
  const downloadName = `${slugify(name)}-logo.${format.toLowerCase()}`;
  return {
    id: image.id,
    name,
    format,
    // SVG'er ligger på Prismics fil-CDN uden om imgix og sendes, som de er.
    previewUrl: is_svg ? image.url : asImageSrc(image, { w: 600, fit: "max" }) ?? image.url,
    // PNG uanset originalformat, så Word og PowerPoint kan bruge dem; auto=format
    // skal væk, ellers vinder browserens foretrukne format over fm=png.
    downloadUrl: is_svg
      ? image.url
      : asImageSrc(image, { auto: undefined, fm: "png", w: PARTNER_MAX_WIDTH, fit: "max", dl: downloadName }) ?? image.url,
    downloadName,
    width: image.dimensions.width,
    height: image.dimensions.height,
  };
}

/** Partnerlogoerne fra sidernes logo-sektioner, så de altid er dem, sitet viser. */
export async function planio_partner_logos(ctx: EviContext): Promise<PartnerLogo[]> {
  const pages = await get_evi_all_pages();
  if (!pages) return [];
  // Når samme logo står på flere sprog, vinder navnet fra hovedsproget.
  const sorted = [...pages].sort(
    (a, b) =>
      Number(b.lang === ctx.tenant.default_locale) -
      Number(a.lang === ctx.tenant.default_locale),
  );

  const logos = new Map<string, PartnerLogo>();
  for (const page of sorted) {
    for (const slice of page.data.slices) {
      if (slice.slice_type !== "logos") continue;
      const items =
        slice.variation === "grouped"
          ? [
              ...slice.primary.group_1_logos,
              ...slice.primary.group_2_logos,
              ...slice.primary.group_3_logos,
            ]
          : slice.primary.logos;
      for (const item of items) {
        if (!isFilled.image(item.logo) || logos.has(item.logo.id)) continue;
        const name = (isFilled.keyText(item.name) ? item.name : item.logo.alt || "").trim();
        logos.set(item.logo.id, partner_logo(item.logo, name || "Logo"));
      }
    }
  }
  return [...logos.values()].sort((a, b) => a.name.localeCompare(b.name, "da"));
}
