import "./globals.css";
import { headers } from "next/headers";
import { cache } from "react";

import { get_tenant_config } from "@/src/lib/tenants";
import { createTenantClient } from "@/prismicio";
import { compute_theme_vars } from "@/src/lib/colors";
import { WIDTH_MAP } from "@/src/lib/width";
import { RADIUS_MAP } from "@/src/lib/radius";
import { resolveFonts } from "@/src/lib/fontResolver";

const get_evi_settings = cache(async (hostname: string) => {
  const tenant = await get_tenant_config(hostname);
  if (!tenant) return null;
  const client = createTenantClient(tenant);
  return client
    .getSingle("settings", { lang: tenant.default_locale })
    .catch(() => null);
});

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
