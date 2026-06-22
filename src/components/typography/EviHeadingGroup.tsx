import {
  type RichTextField,
  type LinkResolverFunction,
  isFilled,
} from "@prismicio/client";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { cn } from "@/src/lib/utils/cn";

export type EviHeadingGroupProps = Omit<
  React.ComponentProps<"hgroup">,
  "children" | "title"
> & {
  /** Overskrift (Prismic rich-text). */
  title?: RichTextField | null | undefined;
  /** Underrubrik (Prismic rich-text). */
  description?: RichTextField | null | undefined;
  /** Bruges til at resolve interne dokument-links i title/description. */
  linkResolver: LinkResolverFunction;
  /** Heading-niveau-shift på title — se EviRichText. */
  isHero?: boolean;
};

export function EviHeadingGroup({
  title,
  description,
  linkResolver,
  isHero,
  className,
  ...props
}: EviHeadingGroupProps): React.ReactElement | null {
  if (!isFilled.richText(title) && !isFilled.richText(description)) return null;

  return (
    <hgroup
      data-slot="evi-heading-group"
      className={cn("evi-prose col-span-12 max-w-prose", className)}
      {...props}
    >
      <EviRichText.Raw
        field={title}
        linkResolver={linkResolver}
        isHero={isHero}
      />
      <EviRichText.Raw field={description} linkResolver={linkResolver} />
    </hgroup>
  );
}
