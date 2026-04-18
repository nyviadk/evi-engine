/**
 * Normaliser hostname inden KV-opslag. "www.evi.nyvia.dk" og "evi.nyvia.dk"
 * peger på samme KV-entry — vi gemmer kun den nøgne form i KV.
 */
export function normalize_hostname(hostname: string): string {
  const lower = hostname.trim().toLowerCase();
  return lower.startsWith("www.") ? lower.slice(4) : lower;
}
