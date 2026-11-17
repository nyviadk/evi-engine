import {
  asLinkAttrs,
  type LinkField,
  type LinkResolverFunction,
} from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { new_tab_target } from "@/src/lib/prismic/links";

export type EviLinkProps = Omit<
  React.ComponentProps<"a">,
  "href" | "rel" | "target"
> & {
  field: LinkField | null | undefined;
  linkResolver?: LinkResolverFunction;
};

/**
 * Prismic-link til alle Evi-komponenter: eksterne links (andre sites, filer)
 * åbner i ny fane, medmindre redaktøren har valgt andet. Brug den i stedet for
 * PrismicNextLink, så reglen gælder overalt; virker også med EviButton asChild.
 */
export function EviLink({
  field,
  linkResolver,
  ...props
}: EviLinkProps): React.ReactElement {
  const { href, target } = asLinkAttrs(field, { linkResolver });
  return (
    <PrismicNextLink
      field={field}
      linkResolver={linkResolver}
      target={target ?? new_tab_target(href)}
      {...props}
    />
  );
}
