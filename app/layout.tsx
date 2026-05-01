import "./globals.css";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { cache } from "react";

export const dynamic = "force-dynamic";

import { get_tenant_config } from "@/src/lib/kv/tenants";
import { createTenantClient } from "@/prismicio";
import { compute_theme_vars, DEFAULTS_COLORS } from "@/src/lib/theme/colors";
import { WIDTH_MAP } from "@/src/lib/theme/width";
import { RADIUS_MAP } from "@/src/lib/theme/radius";
import { resolveFonts } from "@/src/lib/theme/fontResolver";

const get_evi_settings = cache(async (hostname: string) => {
  const tenant = await get_tenant_config(hostname);
  if (!tenant) return null;
  const client = createTenantClient(tenant);
  return client
    .getSingle("settings", { lang: tenant.default_locale })
    .catch(() => null);
});

// Favicon-felter der endnu ikke er med i prismicio-types.d.ts (auto-gen).
// Typerne regenereres af Slice Machine på næste dev/build.
type SettingsWithIcons = {
  favicon_light?: { url?: string | null } | null;
  favicon_dark?: { url?: string | null } | null;
};

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const hostname = h.get("host") || "localhost:3000";
  const settings = await get_evi_settings(hostname);
  const d = settings?.data as (typeof settings extends null
    ? never
    : NonNullable<typeof settings>["data"]) &
    SettingsWithIcons;
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
  const h = await headers();
  const hostname = h.get("host") || "localhost:3000";
  const settings = await get_evi_settings(hostname);
  return {
    themeColor:
      (settings?.data?.color_primary as string | null | undefined) ||
      DEFAULTS_COLORS.color_primary,
    width: "device-width",
    initialScale: 1,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const lang = h.get("x-evi-locale") || "da-dk";
  const hostname = h.get("host") || "localhost:3000";

  const settings = await get_evi_settings(hostname);

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

  // Byg det endelige style-objekt, der skydes ind på <body>
  const themeStyle = {
    ...computedColors,
    "--evi-max-width": WIDTH_MAP[userWidthChoice] || "1280px",
    "--radius-evi": RADIUS_MAP[userRadiusChoice] || "0.5rem",
    "--evi-heading-font": fonts.headingFont,
    "--evi-body-font": fonts.bodyFont,
  } as React.CSSProperties;

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
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
