import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headers_list = await headers();
  const domain = headers_list.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  // MAGIEN: Er dette et Evi test-domæne?
  const is_staging =
    domain.endsWith(".web.nyvia.dk") || domain.includes("localhost");

  if (is_staging) {
    // Fortæl Google: BLIV VÆK!
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  // Hvis det er et ægte domæne (frisoer.dk), så giv fuld adgang
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${protocol}://${domain}/sitemap.xml`,
  };
}
