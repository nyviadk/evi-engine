"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { cn } from "@/src/lib/utils/cn";
import { is_active_path } from "@/src/components/header/parts/navActive";
import { NavAnchor } from "@/src/components/header/parts/NavAnchor";
import type { NavGroup } from "@/src/components/header/parts/navGroups";

const ITEM =
  "block rounded-evi px-3 py-2 text-current no-underline hover:bg-current/5 focus-visible:outline-2 focus-visible:outline-offset-2";

export type NavGroupsDesktopProps = { groups: NavGroup[]; lang?: string };

/**
 * Desktop-nav med dropdowns. Top-punktet (link eller ren tekst) står i baren;
 * har gruppen dropdown-links, folder de ud på hover (pointer) / tastatur-fokus.
 * Aktivt punkt via usePathname (headeren re-renderes ikke server-side ved
 * soft-navigation).
 *
 * Åben-tilstand er JS-STYRET (pointer enter/leave → `openIdx`), IKKE CSS `:hover`.
 * Grunden: en ren hover-menu kan ikke lukkes på klik — pointeren står stadig over
 * panelet, så `:hover` (eller enhver "skjul + ryd på pointerleave"-hack) flimrer
 * det åbent igen. Med state genåbner panelet KUN ved en ægte NY pointer-enter i
 * gruppen; at lukke på klik efterlader det lukket indtil man rehover'er. Tastatur
 * bruger fortsat CSS `:focus-within` (uafhængig sti); klik blur'er så fokus ikke
 * holder det åbent.
 *
 * Keys = index: nav rendres statisk og reorderes aldrig i runtime, så index er
 * et stabilt key (og labels/URLs er ikke garanteret unikke).
 */
export function NavGroupsDesktop({
  groups,
  lang,
}: NavGroupsDesktopProps): React.ReactElement {
  const pathname = usePathname();
  // Hvilken gruppe er åben via pointer (én ad gangen, som en menubar). null = ingen.
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const closeOnClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.currentTarget.blur(); // slip :focus-within (tastatur-stien)
    setOpenIdx(null);
  };

  return (
    <ul className="evi-nav-groups">
      {groups.map((group, gi) => {
        const { top, items } = group;
        const hasDropdown = items.length > 0;
        const topActive =
          top.kind === "link" && is_active_path(top.href, pathname, lang);
        const chevron = hasDropdown ? (
          <ChevronDown size={16} aria-hidden className="ml-0.5 shrink-0" />
        ) : null;
        return (
          <li
            key={gi}
            className="evi-nav-group"
            data-open={hasDropdown && openIdx === gi ? "" : undefined}
            onPointerEnter={hasDropdown ? () => setOpenIdx(gi) : undefined}
            onPointerLeave={
              hasDropdown
                ? () => setOpenIdx((cur) => (cur === gi ? null : cur))
                : undefined
            }
          >
            {top.kind === "link" ? (
              <NavAnchor
                item={top}
                active={topActive}
                onClick={hasDropdown ? closeOnClick : undefined}
                className={cn(ITEM, "inline-flex items-center")}
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
            {hasDropdown && (
              <ul className="evi-nav-dropdown">
                {items.map((item, ii) => {
                  return (
                    <li key={ii}>
                      <NavAnchor
                        item={item}
                        active={is_active_path(item.href, pathname, lang)}
                        onClick={closeOnClick}
                        className={ITEM}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
