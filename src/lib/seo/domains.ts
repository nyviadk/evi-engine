// Vi skriver KUN den rene version af domænerne her! Ingen www.
const OFFICIAL_NYVIA_DOMAINS = [
  "nyvia.dk",
  "evi.nyvia.dk",
  "horizon.nyvia.dk",
  "rise.nyvia.dk",
  "nexus.nyvia.dk",
];

export function is_staging_domain(domain: string): boolean {
  const cleanDomain = domain.replace(/^www\./, "");

  if (cleanDomain.includes("localhost") || cleanDomain.includes("127.0.0.1")) {
    return true;
  }

  // Uofficielt *.nyvia.dk-subdomæne = testkunde (fx testny.nyvia.dk) → noindex.
  if (cleanDomain.endsWith("nyvia.dk")) {
    if (!OFFICIAL_NYVIA_DOMAINS.includes(cleanDomain)) {
      return true;
    }
  }

  return false;
}
