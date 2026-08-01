import {
  isFilled,
  type ImageField,
  type RichTextField,
  type LinkResolverFunction,
} from "@prismicio/client";

import { EviImage, type EviImageProps } from "@/src/components/ui/EviImage";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { cn } from "@/src/lib/utils/cn";

export type EviFigureProps = Pick<
  EviImageProps,
  | "aspectRatio"
  | "mobileField"
  | "mobileAspectRatio"
  | "variant"
  | "priority"
  | "sizes"
  | "imageClassName"
  | "rounded"
  | "hoverZoom"
> & {
  /** Prismic image field. Tomt → intet render (også ingen tom figcaption). */
  field: ImageField;
  /** Valgfri billedtekst under billedet. Tom → ingen `<figcaption>`. */
  caption?: RichTextField | null;
  linkResolver: LinkResolverFunction;
  className?: string;
};

/**
 * EviFigure — billede + valgfri billedtekst i semantisk `<figure>`/`<figcaption>`.
 * Videresender relevante `EviImage`-props (aspect, variant, sizes, priority…).
 */
export function EviFigure({
  field,
  caption,
  linkResolver,
  className,
  ...imageProps
}: EviFigureProps): React.ReactElement | null {
  if (!isFilled.image(field)) return null;

  return (
    <figure
      data-slot="evi-figure"
      className={cn("flex flex-col gap-3", className)}
    >
      <EviImage field={field} {...imageProps} />
      {isFilled.richText(caption) && (
        <figcaption className="evi-prose text-sm text-current [&_p]:m-0">
          <EviRichText.Raw field={caption} linkResolver={linkResolver} />
        </figcaption>
      )}
    </figure>
  );
}
