/**
 * Lille, sløret imgix-variant af et billede som ren URL-streng (Prismic serverer
 * via imgix). Bygger KUN en streng — intet fetch/encode — så den er gratis at
 * bruge i render-pathen: BROWSEREN henter de ~1-2kb som LQIP-placeholder bag
 * det rigtige billede, så store billeder ikke popper ind på tom skærm.
 *
 * URL API så eksisterende params (auto/rect/crop) bevares — en tidligere bug var
 * et rå `?w=…` oveni Prismics eget `?auto=…` = dobbelt `?` = ugyldig URL, ingen
 * blur. Returnerer undefined ved malformet input (så caller kan falde tilbage).
 */
export function lqip_url(url: string): string | undefined {
  try {
    const u = new URL(url);
    u.searchParams.set("w", "48");
    u.searchParams.delete("h"); // lad højden skalere med w → bevar aspect
    u.searchParams.set("blur", "300");
    u.searchParams.set("q", "20");
    return u.toString();
  } catch {
    return undefined;
  }
}
