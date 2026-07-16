import { PrismicNextLink } from "@prismicio/next";
import {
  type LinkField,
  type LinkResolverFunction,
  type Repeatable,
} from "@prismicio/client";
import { is_link_filled } from "@/src/lib/prismic/links";
import { cn } from "@/src/lib/utils/cn";

export type NavListProps = {
  /**
   * Prismic repeatable link-felt. Optional + default [] fordi genererede
   * Prismic-typer påstår feltet altid findes, men runtime kan give undefined
   * (tomt repeatable, eller model-drift efter et felt fjernes/omdøbes) →
   * ellers `undefined.map` crash. Guard ved kilden, én gang.
   */
  items?: Repeatable<LinkField>;
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
  items = [],
  linkResolver,
  className,
  itemClassName,
}: NavListProps): React.ReactElement {
  return (
    <ul className={cn("evi-nav-list", className)}>
      {items.map((link, i) => {
        if (!is_link_filled(link)) return null;
        const itemKey = `${i}-${link.text}`;
        return (
          <li key={itemKey}>
            <PrismicNextLink
              field={link}
              linkResolver={linkResolver}
              className={cn(
                "block rounded-evi px-3 py-2 text-current no-underline hover:bg-current/5 focus-visible:outline-2 focus-visible:outline-offset-2",
                itemClassName,
              )}
            />
          </li>
        );
      })}
    </ul>
  );
}
