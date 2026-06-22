import { isFilled, type ImageField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { cn } from "@/src/lib/utils/cn";

type AspectRatio = "landscape" | "square" | "video" | "portrait" | "auto";

/**
 * Visuel ramme:
 * - `framed`: soft baggrund + padding rundt om billedet.
 * - `plain`: ingen baggrund, ingen padding — billedet fylder containeren.
 *
 * Eksplicit variant fremfor booleans (jf. vercel-composition-patterns):
 * fremtidige visuelle stilarter ("bordered", "shadow", "card") tilføjes
 * her uden at sprænge prop-API'et.
 */
type ImageVariant = "framed" | "plain";

export type EviImageProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Prismic image field. Komponenten rendrer ingenting hvis feltet er tomt. */
  field: ImageField;
  /** Separat image til mobil (art direction via `<picture>`). */
  mobileField?: ImageField;
  /** Aspect ratio på containeren. @default "auto" */
  aspectRatio?: AspectRatio;
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

const variantClasses: Record<ImageVariant, string> = {
  framed: "theme-surface-neutral p-6 md:p-8",
  plain: "",
};

export function EviImage({
  field,
  mobileField,
  aspectRatio = "auto",
  variant = "framed",
  priority = false,
  className,
  imageClassName,
  ...props
}: EviImageProps): React.ReactElement | null {
  if (!isFilled.image(field)) return null;

  const containerClasses = cn(
    "relative w-full overflow-hidden rounded-evi",
    aspectClasses[aspectRatio],
    variantClasses[variant],
    className,
  );

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
      {...props}
    >
      <PrismicNextImage
        field={field}
        className={imgClasses}
        fallbackAlt=""
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
      />
    </div>
  );
}
