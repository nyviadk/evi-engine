// Vi skriver KUN den rene version af domænerne her! Ingen www.
export const OFFICIAL_NYVIA_DOMAINS = [
  "nyvia.dk",
  "evi.nyvia.dk",
  "horizon.nyvia.dk",
  "rise.nyvia.dk",
  "nexus.nyvia.dk",
];

/**
 * Tjekker om et domæne er et test-miljø (staging)
 */
export function is_staging_domain(domain: string): boolean {
  // MAGIEN: Vi fjerner 'www.' med det samme, så vi altid kun arbejder med det rene domæne
  const cleanDomain = domain.replace(/^www\./, "");

  // 1. Localhost er altid test
  if (cleanDomain.includes("localhost") || cleanDomain.includes("127.0.0.1")) {
    return true;
  }

  // 2. Er det et *.nyvia.dk domæne?
  if (cleanDomain.endsWith("nyvia.dk")) {
    // Hvis den rene version IKKE står på listen, er det en testkunde (f.eks. testny.nyvia.dk)
    if (!OFFICIAL_NYVIA_DOMAINS.includes(cleanDomain)) {
      return true; // Google: BLIV VÆK!
    }
  }

  // 3. Alle andre domæner (f.eks. frisoer-jens.dk) er live!
  return false;
}
