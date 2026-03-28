import { PrismicRichText, type PrismicRichTextProps } from "@prismicio/react";
import { PrismicNextLink } from "@prismicio/next";
import type { LinkResolverFunction } from "@prismicio/client";

export function EviRichText(
  props: PrismicRichTextProps & { linkResolver: LinkResolverFunction },
) {
  return (
    <PrismicRichText
      internalLinkComponent={PrismicNextLink}
      {...props}
    />
  );
}
