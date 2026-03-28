import { PrismicNextLink, type PrismicNextLinkProps } from "@prismicio/next";
import type { LinkResolverFunction } from "@prismicio/client";

export function EviLink(
  props: PrismicNextLinkProps & { linkResolver: LinkResolverFunction },
) {
  return <PrismicNextLink {...props} />;
}
