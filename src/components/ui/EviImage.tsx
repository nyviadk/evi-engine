import { isFilled, type ImageField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { force_jpg, jpg_srcset, lqip_url } from "@/src/lib/utils/imgix";
import { cn } from "@/src/lib/utils/cn";

type AspectRatio = "landscape" | "square" | "video" | "portrait" | "3:4" | "auto";

/**
 * Visuel ramme:
 * - `framed`: soft baggrund + padding; neutral-surface er selv placeholder.
 * - `plain`: kant-til-kant; LQIP-blur (imgix, ~1-2kb) som CSS-baggrund så store
 *   billeder ikke popper ind på tom flade. Nul Worker-arbejde.
 *
 * Eksplicit variant frem for booleans (jf. vercel-composition-patterns).
 */
type ImageVariant = "framed" | "plain";

export type EviImageProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Prismic image field. Komponenten rendrer ingenting hvis feltet er tomt. */
  field: ImageField;
  /** Separat image til mobil (art direction via `<picture>`, < 768px). */
  mobileField?: ImageField;
  /** Aspect ratio på containeren (desktop). @default "auto" */
  aspectRatio?: AspectRatio;
  /**
   * Aspect ratio på mobil (< 768px) — til art direction hvor mobil-croppet har
   * et andet forhold end desktop. Kun sat → containeren skifter forhold ved md.
   * Brug sammen med `mobileField` (R9.8). @default samme som `aspectRatio`.
   */
  mobileAspectRatio?: AspectRatio;
  /** Visuel ramme — se `ImageVariant`. @default "framed" */
  variant?: ImageVariant;
  /**
   * LCP-hero. Rendrer et rå `<img>` tvunget til JPEG (+ `decoding="sync"`) i
   * stedet for next/image. imgix serverer uploads som AVIF/WebP der dekoder
   * langsomt → det store hero flasher; JPEG dekoder hurtigt (derfor flasher
   * Unsplash/fm=jpg aldrig). @default false
   */
  priority?: boolean;
  /**
   * Display-størrelse, fx "(min-width: 768px) 45vw, 92vw". Uden den antages 100vw
   * → over-hentning. Bruges på next/image-stien OG hero-`<img>`'ets JPEG-srcSet
   * (browseren vælger opløsning ud fra `sizes`). Ignoreres på ikke-hero art
   * direction (ét fast billede pr. crop, intet srcSet).
   */
  sizes?: string;
  /** Klasse på selve `<img>` / `<PrismicNextImage>`. */
  imageClassName?: string;
  /**
   * Afrundede hjørner på containeren. Slå fra når billedet skal bløde flush ud
   * til en forælders kant (fx et kort der selv klipper hjørnerne). @default true
   */
  rounded?: boolean;
  /**
   * Rund avatar: tvinger square + `rounded-full` + `object-cover` (fylder cirklen)
   * + ingen frame. Til portrætter/avatarer. @default false
   */
  circle?: boolean;
  /**
   * Blødt zoom (~1.03) når en forælder med `group`-klassen hover'es. Kræver at
   * kort-wrapperen har `className="group"` (billedet klippes af containerens
   * `overflow-hidden`).
   *
   * BRUG KUN når HELE kortet er et link — zoom er en "klik mig"-affordance. På
   * kort hvor kun en knap er klikbar (fx bento) lover det interaktivitet der
   * ikke findes → brug det ikke der. @default false
   */
  hoverZoom?: boolean;
};

const aspectClasses: Record<AspectRatio, string> = {
  landscape: "aspect-4/3",
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-9/16",
  "3:4": "aspect-3/4",
  auto: "aspect-auto",
};

// Literale md:-varianter (Tailwind scanner kun statiske strenge).
const mdAspectClasses: Record<AspectRatio, string> = {
  landscape: "md:aspect-4/3",
  square: "md:aspect-square",
  video: "md:aspect-video",
  portrait: "md:aspect-9/16",
  "3:4": "md:aspect-3/4",
  auto: "md:aspect-auto",
};

const variantClasses: Record<ImageVariant, string> = {
  framed: "theme-surface-neutral p-4 sm:p-6 md:p-8",
  plain: "",
};

export function EviImage({
  field,
  mobileField,
  aspectRatio = "auto",
  mobileAspectRatio,
  variant = "framed",
  priority = false,
  sizes,
  className,
  imageClassName,
  rounded = true,
  circle = false,
  hoverZoom = false,
  style,
  ...props
}: EviImageProps): React.ReactElement | null {
  if (!isFilled.image(field)) return null;

  const effectiveVariant = circle ? "plain" : variant;

  // LQIP-blur kun for `plain`; `framed` bruger sin neutral-surface som placeholder.
  // Cirkel dækker fladen (object-cover), så blur-bg'en er unødig der.
  const blurUrl =
    effectiveVariant === "plain" && !circle ? lqip_url(field.url) : undefined;

  const aspectClass = circle
    ? aspectClasses.square
    : mobileAspectRatio
      ? cn(aspectClasses[mobileAspectRatio], mdAspectClasses[aspectRatio])
      : aspectClasses[aspectRatio];

  const containerClasses = cn(
    "relative w-full overflow-hidden",
    circle ? "rounded-full" : rounded && "rounded-evi",
    aspectClass,
    variantClasses[effectiveVariant],
    blurUrl && "bg-cover bg-center",
    className,
  );
  const containerStyle = blurUrl
    ? { ...style, backgroundImage: `url("${blurUrl}")` }
    : style;

  // select-none: præsentationelle billeder skal ikke highlightes/ghost-dragges
  // ved tekst-markering. Ingen a11y-omkostning (skærmlæsere bruger alt).
  const imgClasses = cn(
    "size-full object-contain select-none",
    circle && "object-cover",
    hoverZoom &&
      "transition-transform duration-500 ease-out group-hover:scale-[1.03]",
    imageClassName,
  );

  // Rå <img> til hero (priority) ELLER art direction (mobileField — next/image
  // kan ikke <picture>). Hero tvinges til JPEG: imgix' AVIF/WebP dekoder for
  // langsomt → LCP-billedet flasher; JPEG dekoder hurtigt. decoding="sync" +
  // width/height mod CLS. next/image kan ikke tvinges til fm=jpg uden custom loader.
  if (priority || isFilled.image(mobileField)) {
    const width = field.dimensions?.width ?? undefined;
    const height = field.dimensions?.height ?? undefined;
    const src = priority ? force_jpg(field.url) : field.url;
    const srcSet = priority ? jpg_srcset(field.url, width) : undefined;
    return (
      <div
        data-slot="evi-image"
        data-variant={effectiveVariant}
        className={containerClasses}
        style={containerStyle}
        {...props}
      >
        {/* `<picture>` er inline by default → nul højde, hvilket bryder en
            `size-full` billed-fyld (fx full-bleed cover). block + size-full gør
            elementet til en rigtig fuld-højde container. Uskadeligt i aspect-
            containere (fylder bare boksen som før). */}
        <picture className="block size-full">
          {isFilled.image(mobileField) && (
            <source
              media="(max-width: 768px)"
              srcSet={
                priority
                  ? jpg_srcset(mobileField.url, mobileField.dimensions?.width) ??
                    force_jpg(mobileField.url)
                  : mobileField.url
              }
              sizes={priority ? sizes : undefined}
            />
          )}
          <img
            src={src}
            srcSet={srcSet}
            sizes={priority ? sizes : undefined}
            alt={field.alt ?? ""}
            width={width}
            height={height}
            className={imgClasses}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding={priority ? "sync" : "async"}
          />
        </picture>
      </div>
    );
  }

  // Ikke-hero → PrismicNextImage (lazy). WebP/AVIF fint her (ikke LCP).
  return (
    <div
      data-slot="evi-image"
      data-variant={effectiveVariant}
      className={containerClasses}
      style={containerStyle}
      {...props}
    >
      <PrismicNextImage
        field={field}
        className={imgClasses}
        fallbackAlt=""
        sizes={sizes}
        loading="lazy"
      />
    </div>
  );
}
