import { PrismicNextLink } from "@prismicio/next";
import {
  isFilled,
  type LinkField,
  type LinkResolverFunction,
} from "@prismicio/client";
import { cn } from "@/src/lib/utils/cn";

export type HeaderCTAButtonProps = {
  link: LinkField;
  linkResolver: LinkResolverFunction;
  className?: string;
};

/**
 * Optional CTA button in the header. Renders nothing when link is unfilled or
 * lacks label text — parent can drop it in unconditionally; the component
 * short-circuits internally.
 */
export function HeaderCTAButton({
  link,
  linkResolver,
  className,
}: HeaderCTAButtonProps): React.ReactElement | null {
  if (!isFilled.link(link)) return null;
  const label = isFilled.keyText(link.text) ? link.text : null;
  if (!label) return null;

  return (
    <PrismicNextLink
      field={link}
      linkResolver={linkResolver}
      className={cn(
        "btn theme-primary inline-flex items-center rounded-evi px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
    >
      {label}
    </PrismicNextLink>
  );
}
