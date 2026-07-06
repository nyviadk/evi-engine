import { PrismicNextLink } from "@prismicio/next";
import {
  isFilled,
  type LinkField,
  type LinkResolverFunction,
  type Repeatable,
} from "@prismicio/client";
import { cn } from "@/src/lib/utils/cn";

export type NavListProps = {
  items: Repeatable<LinkField>;
  linkResolver: LinkResolverFunction;
  className?: string;
  itemClassName?: string;
};

/**
 * Renders a flat list of nav links from a Prismic repeatable link field.
 * Each link uses link.text as the label (allowed via --allow-text on the field).
 * Items with no filled link OR no label are silently skipped.
 */
export function NavList({
  items,
  linkResolver,
  className,
  itemClassName,
}: NavListProps): React.ReactElement {
  return (
    <ul className={cn("evi-nav-list", className)}>
      {items.map((link, i) => {
        if (!isFilled.link(link)) return null;
        const label = isFilled.keyText(link.text) ? link.text : null;
        if (!label) return null;
        return (
          <li key={i}>
            <PrismicNextLink
              field={link}
              linkResolver={linkResolver}
              className={cn(
                "block rounded-evi px-3 py-2 text-current no-underline hover:bg-current/5 focus-visible:outline-2 focus-visible:outline-offset-2",
                itemClassName,
              )}
            >
              {label}
            </PrismicNextLink>
          </li>
        );
      })}
    </ul>
  );
}
