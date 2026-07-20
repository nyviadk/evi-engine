import "./globals.css";
import type { Metadata, Viewport } from "next";

import { compute_theme_vars, DEFAULTS_COLORS } from "@/src/lib/theme/colors";
import { WIDTH_MAP } from "@/src/lib/theme/width";
import { RADIUS_MAP } from "@/src/lib/theme/radius";
import { resolveFonts } from "@/src/lib/theme/fontResolver";
import { get_evi_context } from "@/src/lib/prismic/context";

// Favicon-felter der endnu ikke er med i prismicio-types.d.ts (auto-gen).
// Typerne regenereres af Slice Machine på næste dev/build.
type SettingsWithIcons = {
  favicon_light?: { url?: string | null } | null;
  favicon_dark?: { url?: string | null } | null;
};

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await get_evi_context();
  const d = ctx?.settings?.data as
    | (NonNullable<NonNullable<typeof ctx>["settings"]>["data"] &
        SettingsWithIcons)
    | undefined;
  const light = d?.favicon_light?.url || null;
  const dark = d?.favicon_dark?.url || null;

  // Begge uploadet → browseren vælger via prefers-color-scheme.
  if (light && dark) {
    return {
      icons: {
        icon: [
          { url: light, media: "(prefers-color-scheme: light)" },
          { url: dark, media: "(prefers-color-scheme: dark)" },
        ],
      },
    };
  }
  // Kun én uploadet → servér uden media så den bruges i begge themes.
  if (light || dark) {
    return { icons: { icon: [{ url: (light || dark) as string }] } };
  }
  // Ingen uploadet → Next serverer app/favicon.ico via filkonventionen.
  return {};
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

  // Udregn farverne (din nuværende motor)
  const computedColors = compute_theme_vars({
    color_light: settings?.data?.color_light ?? null,
    color_dark: settings?.data?.color_dark ?? null,
    color_primary: settings?.data?.color_primary ?? null,
    color_secondary: settings?.data?.color_secondary ?? null,
  });

  const userWidthChoice = settings?.data?.layout_width as string;
  const userRadiusChoice = settings?.data?.border_radius as string;

  // Font-resolver: custom_font_input → font_select → "Inter"
  const fonts = resolveFonts({
    custom_font_input: settings?.data?.custom_font_input as string,
    font_select: settings?.data?.font_select as string,
  });

  // Browser-tema: styrer scrollbars + native form-kontroller (select, date-picker).
  // Tenant kan vælge "Lys" | "Mørk" | "Lys & mørk (auto)" i Prismic; default "Lys".
  const colorSchemeChoice = settings?.data?.color_scheme || "Lys";
  const colorScheme =
    colorSchemeChoice === "Mørk"
      ? "dark"
      : colorSchemeChoice === "Lys & mørk (auto)"
        ? "light dark"
        : "light";

  // Byg det endelige style-objekt, der skydes ind på <body>.
  // React.CSSProperties tillader ikke vilkårlige --custom-properties direkte.
  const themeStyle: React.CSSProperties & Record<`--${string}`, string> = {
    ...computedColors,
    "--evi-max-width": WIDTH_MAP[userWidthChoice] || "1280px",
    "--radius-evi": RADIUS_MAP[userRadiusChoice] || "0.5rem",
    "--evi-heading-font": fonts.headingFont,
    "--evi-body-font": fonts.bodyFont,
    colorScheme,
  };

  return (
    <html
      lang={lang}
      className={fonts.htmlClass || undefined}
      style={themeStyle}
    >
      <head>
        {fonts.bunny && (
          <>
            <link
              rel="preconnect"
              href="https://fonts.bunny.net"
              crossOrigin="anonymous"
            />
            <link rel="stylesheet" href={fonts.bunny.stylesheet} />
          </>
        )}
      </head>
      <body className="antialiased">
        {/* Skip-link: første fokuserbare element i DOM'en, skjult indtil
            tastaturbrugere tab'er hertil. WCAG 2.4.1 Level A. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-evi focus:bg-evi-primary focus:px-4 focus:py-2 focus:text-evi-text-on-primary"
        >
          Spring til indhold
        </a>
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
