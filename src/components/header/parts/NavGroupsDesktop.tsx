"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { cn } from "@/src/lib/utils/cn";
import { is_active_path } from "@/src/components/header/parts/navActive";
import type {
  NavGroup,
  NavLink,
} from "@/src/components/header/parts/navGroups";

const ITEM =
  "block rounded-evi px-3 py-2 text-current no-underline hover:bg-current/5 focus-visible:outline-2 focus-visible:outline-offset-2";
const ACTIVE = "font-semibold underline decoration-2 underline-offset-4";

function NavAnchor({
  item,
  active,
  className,
  children,
}: {
  item: NavLink;
  active: boolean;
  className?: string;
  children?: React.ReactNode;
}): React.ReactElement {
  const cls = cn(ITEM, active && ACTIVE, className);
  return item.external ? (
    <a href={item.href} target={item.target} rel={item.rel} className={cls}>
      {children ?? item.label}
    </a>
  ) : (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cls}
    >
      {children ?? item.label}
    </Link>
  );
}

export type NavGroupsDesktopProps = { groups: NavGroup[]; lang?: string };

/**
 * Desktop-nav med dropdowns. Top-punktet (link eller ren tekst) står i baren;
 * har gruppen dropdown-links, folder de ud på hover/tastatur-fokus — ren CSS
 * (`:hover`/`:focus-within`, se globals H), ingen JS. Aktivt punkt via
 * usePathname (headeren re-renderes ikke server-side ved soft-navigation).
 *
 * Keys = index + label/href: labels/URLs er ikke garanteret unikke (editor kan
 * gentage dem), så index sikrer entydighed; listen reorderes ikke i runtime.
 */
export function NavGroupsDesktop({
  groups,
  lang,
}: NavGroupsDesktopProps): React.ReactElement {
  const pathname = usePathname();
  return (
    <ul className="evi-nav-groups">
      {groups.map((group, gi) => {
        const { top, items } = group;
        const hasDropdown = items.length > 0;
        const groupKey = `${gi}-${top.label}`;
        const topActive =
          top.kind === "link" && is_active_path(top.href, pathname, lang);
        const chevron = hasDropdown ? (
          <ChevronDown size={16} aria-hidden className="ml-0.5 shrink-0" />
        ) : null;
        return (
          <li key={groupKey} className="evi-nav-group">
            {top.kind === "link" ? (
              <NavAnchor
                item={top}
                active={topActive}
                className="inline-flex items-center"
              >
                {top.label}
                {chevron}
              </NavAnchor>
            ) : (
              <span
                tabIndex={hasDropdown ? 0 : undefined}
                aria-haspopup={hasDropdown ? "menu" : undefined}
                className={cn(ITEM, "inline-flex cursor-default items-center")}
              >
                {top.label}
                {chevron}
              </span>
            )}
            {hasDropdown ? (
              <ul className="evi-nav-dropdown">
                {items.map((item, ii) => {
                  const itemKey = `${ii}-${item.href}`;
                  return (
                    <li key={itemKey}>
                      <NavAnchor
                        item={item}
                        active={is_active_path(item.href, pathname, lang)}
                      />
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
