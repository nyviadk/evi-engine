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

/**
 * Tvinger et Prismic/imgix-billede til JPEG. imgix serverer uploads som
 * `auto=format` → AVIF/WebP, som DEKODER langsomt; på et stort LCP-hero popper
 * billedet ind efter paint = flash. JPEG dekoder hurtigt → intet flash (derfor
 * flasher Unsplash-billeder, der allerede er `fm=jpg`, aldrig). Kun værd på
 * hero'en — WebP/AVIF beholdes ellers (mindre download, ikke-LCP = ingen synlig
 * flash). Drop `format` fra `auto` FØR `fm` sættes: `auto=format` overstyrer ellers
 * `fm` (imgix-regel). `auto=compress` bevares. Returnerer input uændret ved fejl.
 *
 * GOTCHA: JPEG har ingen alpha → imgix fladgør transparens til en solid farve.
 * Kun sikkert på opake billeder (heroes er ~altid opake fotos, uanset om kunden
 * uploader JPG/PNG/WebP — imgix leverer alligevel alt som AVIF/WebP uden fixet).
 */
export function force_jpg(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("auto", "compress");
    u.searchParams.set("fm", "jpg");
    return u.toString();
  } catch {
    return url;
  }
}
