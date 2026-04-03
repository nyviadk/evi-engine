import { PrismicNextLink } from "@prismicio/next";
import { type LinkResolverFunction, type LinkField, isFilled } from "@prismicio/client";

type EviLinkProps = {
  field: LinkField;
  linkResolver: LinkResolverFunction;
  className?: string;
  children?: React.ReactNode;
};

export function EviLink({ field, linkResolver, className, children }: EviLinkProps) {
  if (!isFilled.link(field)) return null;

  return (
    <PrismicNextLink field={field} linkResolver={linkResolver} className={className}>
      {children}
    </PrismicNextLink>
  );
}
