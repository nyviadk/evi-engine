import {
  asLinkAttrs,
  isFilled,
  type LinkField,
  type LinkResolverFunction,
  type Repeatable,
} from "@prismicio/client";

import { new_tab_target } from "@/src/lib/prismic/links";

/** Et top-/dropdown-punkt der ER et link (kun serialiserbare felter → klient). */
export type NavLink = {
  kind: "link";
  href: string;
  label: string;
  external: boolean;
  target?: string;
  rel?: string;
};

/** Top-punkt uden URL — vises som ren tekst (fx hvis siden ikke findes endnu). */
export type NavText = { kind: "text"; label: string };

/** Én menu-gruppe: `top` = det synlige menupunkt, `items` = dropdown-links (evt. tom). */
export type NavGroup = { top: NavLink | NavText; items: NavLink[] };

/** Én `nav_groups`-række i en header-slice. */
export type NavGroupItem = { links: Repeatable<LinkField> };

/**
 * Server-side: resolver hver Prismic-gruppe til serialiserbare punkter.
 * Konvention: FØRSTE udfyldte link = det synlige menupunkt (top), resten =
 * dropdown. Et allowText-link uden URL bliver et rent tekst-top-punkt.
 * Dropdown-punkter uden URL (kun tekst) giver ingen destination → springes over.
 */
export function resolve_nav_groups(
  groups: readonly NavGroupItem[] | undefined,
  linkResolver: LinkResolverFunction,
): NavGroup[] {
  const result: NavGroup[] = [];
  for (const group of groups ?? []) {
    const resolved: (NavLink | NavText)[] = [];
    for (const link of group.links ?? []) {
      if (!isFilled.keyText(link.text)) continue;
      const label = link.text;
      if (isFilled.link(link)) {
        const attrs = asLinkAttrs(link, { linkResolver });
        const href = attrs.href ?? "#";
        resolved.push({
          kind: "link",
          href,
          label,
          external: !href.startsWith("/"),
          target: attrs.target ?? new_tab_target(href),
          rel: attrs.rel,
        });
      } else {
        resolved.push({ kind: "text", label });
      }
    }
    const top = resolved[0];
    if (!top) continue;
    const items = resolved
      .slice(1)
      .filter((r): r is NavLink => r.kind === "link");
    result.push({ top, items });
  }
  return result;
}
