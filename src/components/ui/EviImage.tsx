import { isFilled, type ImageField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { lqip_url } from "@/src/lib/utils/imgix";
import { cn } from "@/src/lib/utils/cn";

type AspectRatio = "landscape" | "square" | "video" | "portrait" | "auto";

/**
 * Visuel ramme:
 * - `framed`: soft baggrund + padding rundt om billedet. Neutral-surface er
 *   selv placeholder mens billedet loader.
 * - `plain`: ingen baggrund/padding — billedet fylder containeren. Får en blød
 *   LQIP-blur (imgix, ~1-2kb) som CSS-baggrund, så store billeder ikke popper
 *   ind på tom baggrund. Nul Worker-arbejde — browseren henter tinten selv.
 *
 * Eksplicit variant fremfor booleans (jf. vercel-composition-patterns):
 * fremtidige visuelle stilarter ("bordered", "shadow", "card") tilføjes
 * her uden at sprænge prop-API'et.
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
  /** LCP-hero: loading="eager" + fetchPriority="high". @default false */
  priority?: boolean;
  /** Klasse på selve `<img>` / `<PrismicNextImage>`. */
  imageClassName?: string;
};

const aspectClasses: Record<AspectRatio, string> = {
  landscape: "aspect-4/3",
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-9/16",
  auto: "aspect-auto",
};

// Literale md:-varianter (Tailwind scanner kun statiske strenge) → mobil-first
// aspect med desktop-override ved md, når mobileAspectRatio er sat.
const mdAspectClasses: Record<AspectRatio, string> = {
  landscape: "md:aspect-4/3",
  square: "md:aspect-square",
  video: "md:aspect-video",
  portrait: "md:aspect-9/16",
  auto: "md:aspect-auto",
};

const variantClasses: Record<ImageVariant, string> = {
  framed: "theme-surface-neutral p-6 md:p-8",
  plain: "",
};

export function EviImage({
  field,
  mobileField,
  aspectRatio = "auto",
  mobileAspectRatio,
  variant = "framed",
  priority = false,
  className,
  imageClassName,
  style,
  ...props
}: EviImageProps): React.ReactElement | null {
  if (!isFilled.image(field)) return null;

  // LQIP-blur kun for `plain` (kant-til-kant cover). `framed` bruger sin
  // neutral-surface som placeholder. lqip_url bygger KUN en URL-streng.
  const blurUrl = variant === "plain" ? lqip_url(field.url) : undefined;

  // Mobil-first aspect (mobileAspectRatio) med desktop-override ved md.
  const aspectClass = mobileAspectRatio
    ? cn(aspectClasses[mobileAspectRatio], mdAspectClasses[aspectRatio])
    : aspectClasses[aspectRatio];

  const containerClasses = cn(
    "relative w-full overflow-hidden rounded-evi",
    aspectClass,
    variantClasses[variant],
    blurUrl && "bg-cover bg-center",
    className,
  );
  const containerStyle = blurUrl
    ? { ...style, backgroundImage: `url("${blurUrl}")` }
    : style;

  const imgClasses = cn("size-full object-contain", imageClassName);

  // Hero art direction: separate desktop/mobile images via <picture>
  if (isFilled.image(mobileField)) {
    // width/height fra Prismic forhindrer Cumulative Layout Shift mens
    // billedet loader. PrismicNextImage gør det automatisk; vores manuelle
    // <img> skal hente det fra field.dimensions.
    const width = field.dimensions?.width ?? undefined;
    const height = field.dimensions?.height ?? undefined;
    return (
      <div
        data-slot="evi-image"
        data-variant={variant}
        className={containerClasses}
        style={containerStyle}
        {...props}
      >
        <picture>
          <source media="(max-width: 768px)" srcSet={mobileField.url ?? ""} />
          <img
            src={field.url ?? ""}
            alt={field.alt ?? ""}
            width={width}
            height={height}
            className={imgClasses}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
          />
        </picture>
      </div>
    );
  }

  // Standard: PrismicNextImage for Next.js optimering
  return (
    <div
      data-slot="evi-image"
      data-variant={variant}
      className={containerClasses}
      style={containerStyle}
      {...props}
    >
      <PrismicNextImage
        field={field}
        className={imgClasses}
        fallbackAlt=""
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </div>
  );
}
