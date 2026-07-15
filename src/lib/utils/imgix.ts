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

// Op til ~1200 dækker en kolonne-hero (max ~45vw) på retina; over kildens egen
// bredde upscaler imgix bare → derfor cappes der på billedets faktiske bredde.
const SRCSET_WIDTHS = [480, 640, 828, 1080, 1200, 1600, 1920];

/**
 * JPEG-`srcSet` (width-deskriptorer) til den rå hero-`<img>`. = `force_jpg` pr.
 * bredde: hver variant er JPEG (hurtig dekode → intet dekode-flash, i modsætning
 * til et WebP/AVIF-srcSet) og henter en mindre dimension på mobil → vinder en del
 * af de KB tilbage som JPEG koster vs WebP. `maxWidth` (billedets egen bredde)
 * capper listen så vi ikke upscaler. Sletter `h` så højden skalerer med `w` →
 * aspect bevaret af crop'et. Returnerer undefined ved malformet input.
 */
export function jpg_srcset(url: string, maxWidth?: number): string | undefined {
  try {
    const cap = maxWidth ?? Infinity;
    const widths = SRCSET_WIDTHS.filter((w) => w <= cap);
    if (maxWidth && !widths.includes(maxWidth)) widths.push(maxWidth);
    return widths
      .map((w) => {
        const u = new URL(url);
        u.searchParams.set("auto", "compress");
        u.searchParams.set("fm", "jpg");
        u.searchParams.set("w", String(w));
        u.searchParams.delete("h");
        return `${u.toString()} ${w}w`;
      })
      .join(", ");
  } catch {
    return undefined;
  }
}
