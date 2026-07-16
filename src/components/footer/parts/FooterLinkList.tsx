import { PrismicNextLink } from "@prismicio/next";
import {
  type LinkField,
  type LinkResolverFunction,
  type Repeatable,
} from "@prismicio/client";
import { is_link_filled } from "@/src/lib/prismic/links";
import { EviStack } from "@/src/components/layout/EviStack";
import { cn } from "@/src/lib/utils/cn";

export type FooterLinkListProps = {
  /**
   * Prismic repeatable link-felt. Optional + default [] fordi genererede
   * Prismic-typer påstår feltet altid findes, men runtime kan give undefined
   * (tomt repeatable, eller model-drift) → ellers `undefined.map` crash.
   */
  items?: Repeatable<LinkField>;
  linkResolver: LinkResolverFunction;
  /** Layout axis. Vertical for column links; horizontal for legal links row. */
  direction?: "col" | "row";
  /** Only relevant when direction="row" — wrap onto new lines if too narrow. */
  wrap?: boolean;
  className?: string;
};

/**
 * Semantic `<ul>` of Prismic links, laid out via EviStack for consistent
 * gap/direction across the design system. Items missing a filled link OR
 * label are silently skipped.
 */
export function FooterLinkList({
  items = [],
  linkResolver,
  direction = "col",
  wrap = false,
  className,
}: FooterLinkListProps): React.ReactElement {
  return (
    <EviStack
      as="ul"
      gap={direction === "row" ? "md" : "sm"}
      direction={direction}
      wrap={wrap}
      className={cn("evi-footer-link-list list-none", className)}
    >
      {items.map((link, i) => {
        if (!is_link_filled(link)) return null;
        const itemKey = `${i}-${link.text}`;
        return (
          <li key={itemKey}>
            <PrismicNextLink
              field={link}
              linkResolver={linkResolver}
              className="text-sm text-current/70 no-underline hover:text-current focus-visible:outline-2 focus-visible:outline-offset-2"
            />
          </li>
        );
      })}
    </EviStack>
  );
}
