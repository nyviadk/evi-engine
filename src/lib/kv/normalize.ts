/**
 * Normaliser hostname inden KV-opslag. "www.evi.nyvia.dk" og "evi.nyvia.dk"
 * peger på samme KV-entry — vi gemmer kun den nøgne form i KV.
 *
 * Punycode: spec-compliant browsere sender allerede Punycode i Host headeren,
 * men curl og andre klienter kan sende rå Unicode. KV gemmer altid Punycode
 * (via push-tenant-flowet), så opslaget skal matche uanset klientens form.
 */
export function normalize_hostname(hostname: string): string {
  const lower = hostname.trim().toLowerCase();
  const without_www = lower.startsWith("www.") ? lower.slice(4) : lower;

  try {
    return new URL(`https://${without_www}`).host;
  } catch {
    return without_www;
  }
}
