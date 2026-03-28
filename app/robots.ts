import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headers_list = await headers();
  const domain = headers_list.get("host") || "localhost:3000";

  // Sørg for at bruge https i produktion
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    // Nu peger den ALTID på den rigtige kundes sitemap!
    sitemap: `${protocol}://${domain}/sitemap.xml`,
  };
}
