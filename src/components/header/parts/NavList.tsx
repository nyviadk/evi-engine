import {
  asLinkAttrs,
  type LinkField,
  type LinkResolverFunction,
  type Repeatable,
} from "@prismicio/client";
import { is_link_filled } from "@/src/lib/prismic/links";
import { NavLinks, type NavLinkItem } from "@/src/components/header/parts/NavLinks";

export type NavListProps = {
  /**
   * Prismic repeatable link-felt. Optional + default [] fordi genererede
   * Prismic-typer påstår feltet altid findes, men runtime kan give undefined
   * (tomt repeatable, eller model-drift efter et felt fjernes/omdøbes) →
   * ellers `undefined.map` crash. Guard ved kilden, én gang.
   */
  items?: Repeatable<LinkField>;
  linkResolver: LinkResolverFunction;
  /** Nuværende locale — videresendes til NavLinks til "du er her"-strip. */
  lang?: string;
  className?: string;
  itemClassName?: string;
};

/**
 * Server-side: resolver hvert Prismic-link til serialiserbare attributter
 * (href/target/rel + label) og delegerer selve renderingen + "du er her"-
 * markeringen til NavLinks (klient) — active-state skal beregnes på klienten
 * med `usePathname()`, da headeren ikke re-renderes ved soft-navigation.
 *
 * Links uden udfyldt mål ELLER label springes over.
 */
export function NavList({
  items = [],
  linkResolver,
  lang,
  className,
  itemClassName,
}: NavListProps): React.ReactElement {
  const resolved: NavLinkItem[] = [];
  for (const link of items) {
    if (!is_link_filled(link)) continue;
    const attrs = asLinkAttrs(link, { linkResolver });
    const href = attrs.href ?? "#";
    resolved.push({
      href,
      label: link.text ?? "",
      external: !href.startsWith("/"),
      target: attrs.target,
      rel: attrs.rel,
    });
  }

  return (
    <NavLinks
      items={resolved}
      lang={lang}
      className={className}
      itemClassName={itemClassName}
    />
  );
}
