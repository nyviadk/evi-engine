import { isFilled, type ImageField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

type AspectRatio = "landscape" | "square" | "video" | "portrait" | "auto";

interface EviImageProps {
  field: ImageField;
  mobileField?: ImageField;
  aspectRatio?: AspectRatio;
  withBackground?: boolean;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}

const aspectClasses: Record<AspectRatio, string> = {
  landscape: "aspect-4/3",
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-9/16",
  auto: "aspect-auto",
};

export function EviImage({
  field,
  mobileField,
  aspectRatio = "auto",
  withBackground = true,
  priority = false,
  className,
  imageClassName,
}: EviImageProps) {
  if (!isFilled.image(field)) return null;

  const containerClasses = twMerge(
    clsx(
      "relative w-full overflow-hidden rounded-evi",
      aspectClasses[aspectRatio],
      withBackground && "theme-surface-neutral p-6 md:p-8",
    ),
    className,
  );

  const imgClasses = twMerge(
    clsx("w-full h-full object-contain"),
    imageClassName,
  );

  // Hero art direction: separate desktop/mobile images via <picture>
  if (isFilled.image(mobileField)) {
    return (
      <div className={containerClasses}>
        <picture>
          <source media="(max-width: 768px)" srcSet={mobileField.url ?? ""} />
          <img
            src={field.url ?? ""}
            alt={field.alt ?? ""}
            className={imgClasses}
            loading={priority ? "eager" : "lazy"}
          />
        </picture>
      </div>
    );
  }

  // Standard: PrismicNextImage for Next.js optimering
  return (
    <div className={containerClasses}>
      <PrismicNextImage
        field={field}
        className={imgClasses}
        fallbackAlt=""
        priority={priority}
      />
    </div>
  );
}
