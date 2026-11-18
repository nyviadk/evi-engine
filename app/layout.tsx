import "./globals.css";
import type { Metadata, Viewport } from "next";
import { isFilled } from "@prismicio/client";
import { preload } from "react-dom";

import { compute_theme_vars, DEFAULTS_COLORS } from "@/src/lib/theme/colors";
import { WIDTH_MAP } from "@/src/lib/theme/width";
import { RADIUS_MAP } from "@/src/lib/theme/radius";
import { TEXT_SCALE_MAP } from "@/src/lib/theme/textScale";
import { resolveFonts } from "@/src/lib/theme/fontResolver";
import { get_evi_context } from "@/src/lib/prismic/context";
import { EviPaperGrain } from "@/src/components/ui/EviPaperGrain";
import { system_copy } from "@/src/lib/i18n/system-pages";

// iOS' hjemmeskærm-ikon (180×180). iOS fylder gennemsigtighed med sort, så det
// fyldes med sitets lyse farve i stedet.
function apple_touch_icon(url: string | null, background: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    u.searchParams.set("w", "180");
    u.searchParams.set("h", "180");
    u.searchParams.set("bg", background.replace("#", ""));
    return u.toString();
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await get_evi_context();
  const d = ctx?.settings?.data;
  const light = isFilled.image(d?.favicon_light) ? d.favicon_light.url : null;
  const dark = isFilled.image(d?.favicon_dark) ? d.favicon_dark.url : null;
  const apple = apple_touch_icon(light || dark, d?.color_light || DEFAULTS_COLORS.color_light);

  // Begge uploadet → browseren vælger via prefers-color-scheme.
  if (light && dark) {
    return {
      icons: {
        icon: [
          { url: light, media: "(prefers-color-scheme: light)" },
          { url: dark, media: "(prefers-color-scheme: dark)" },
        ],
        ...(apple && { apple }),
      },
    };
  }
  // Kun én uploadet → servér uden media så den bruges i begge themes.
  if (light || dark) {
    return { icons: { icon: [{ url: (light || dark) as string }], ...(apple && { apple }) } };
  }
  // Ingen uploadet → Evis eget ikon. Det ligger i public/, ikke app/: Next sætter
  // altid app/favicon.ico i <head>, så det ville konkurrere med sitets eget ikon.
  return { icons: { icon: [{ url: "/favicon.ico" }] } };
}

export async function generateViewport(): Promise<Viewport> {
  const ctx = await get_evi_context();
  return {
    themeColor:
      (ctx?.settings?.data?.color_primary as string | null | undefined) ||
      DEFAULTS_COLORS.color_primary,
    width: "device-width",
    initialScale: 1,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const ctx = await get_evi_context();
  const settings = ctx?.settings;
  const lang = ctx?.lang || "da-dk";
  const grainOn = settings?.data?.paper_grain === "Til";

  const computedColors = compute_theme_vars({
    color_light: settings?.data?.color_light ?? null,
    color_dark: settings?.data?.color_dark ?? null,
    color_primary: settings?.data?.color_primary ?? null,
    color_secondary: settings?.data?.color_secondary ?? null,
  });

  const userWidthChoice = settings?.data?.layout_width as string;
  const userRadiusChoice = settings?.data?.border_radius as string;
  const textScale = TEXT_SCALE_MAP[settings?.data?.text_scale as string];

  const fonts = resolveFonts({
    font_select: settings?.data?.font_select as string,
  });
  // preload() i stedet for et <link>-element: React hoister selv preload-links,
  // så et element i <head> endte med at stå der to gange.
  if (fonts.preloadHref) {
    preload(fonts.preloadHref, {
      as: "font",
      type: "font/woff2",
      crossOrigin: "anonymous",
    });
  }

  // Browser-tema: styrer scrollbars + native form-kontroller (select, date-picker).
  // Tenant kan vælge "Lys" | "Mørk" | "Lys & mørk (auto)" i Prismic; default "Lys".
  const colorSchemeChoice = settings?.data?.color_scheme || "Lys";
  const colorScheme =
    colorSchemeChoice === "Mørk"
      ? "dark"
      : colorSchemeChoice === "Lys & mørk (auto)"
        ? "light dark"
        : "light";

  // React.CSSProperties tillader ikke vilkårlige --custom-properties direkte.
  const themeStyle: React.CSSProperties & Record<`--${string}`, string> = {
    ...computedColors,
    "--evi-max-width": WIDTH_MAP[userWidthChoice] || "1280px",
    "--radius-evi": RADIUS_MAP[userRadiusChoice] || "0.5rem",
    "--type-scale": textScale?.scale ?? "1",
    "--heading-damp": textScale?.headingDamp ?? "1",
    "--evi-heading-font": fonts.headingFont,
    "--evi-body-font": fonts.bodyFont,
    colorScheme,
  };

  return (
    <html lang={lang} style={themeStyle}>
      <head>
        {fonts.fontFaceCss && (
          // Indholdet kommer fra SELF_HOSTED_FONTS (kode), aldrig fra Prismic-tekst.
          <style dangerouslySetInnerHTML={{ __html: fonts.fontFaceCss }} />
        )}
      </head>
      <body className="antialiased">
        {/* Skip-link: første fokuserbare element i DOM'en, skjult indtil
            tastaturbrugere tab'er hertil. WCAG 2.4.1 Level A. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-999 focus:rounded-evi focus:bg-evi-primary focus:px-4 focus:py-2 focus:text-evi-text-on-primary"
        >
          {system_copy(lang).skipToContent}
        </a>
        {/* <main id="main"> sættes af layoutet/siden under, kun om sidens
            indhold: så springer skip-linket headeren over, og header/footer
            beholder deres landmarks (banner/contentinfo). */}
        {children}
        {grainOn && <EviPaperGrain />}
      </body>
    </html>
  );
}
