"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { cn } from "@/src/lib/utils/cn";
import { is_active_path } from "@/src/components/header/parts/navActive";
import type {
  NavGroup,
  NavLink,
} from "@/src/components/header/parts/navGroups";

const ROW =
  "block rounded-evi px-3 py-3 text-current no-underline hover:bg-current/5 focus-visible:outline-2 focus-visible:outline-offset-2";
const ACTIVE = "font-semibold underline decoration-2 underline-offset-4";

function MobileAnchor({
  item,
  active,
  className,
}: {
  item: NavLink;
  active: boolean;
  className?: string;
}): React.ReactElement {
  const cls = cn(ROW, active && ACTIVE, className);
  return item.external ? (
    <a href={item.href} target={item.target} rel={item.rel} className={cls}>
      {item.label}
    </a>
  ) : (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cls}
    >
      {item.label}
    </Link>
  );
}

function Dropdown({
  items,
  pathname,
  lang,
  id,
}: {
  items: NavLink[];
  pathname: string;
  lang?: string;
  id: string;
}): React.ReactElement {
  // Indrykket bag en venstre-kant, så under-links tydeligt hører under gruppen.
  return (
    <ul
      id={id}
      className="mt-1 ml-4 flex flex-col gap-1 border-l border-current/20 pl-4 text-base"
    >
      {items.map((item, ii) => {
        const itemKey = `${ii}-${item.href}`;
        return (
          <li key={itemKey}>
            <MobileAnchor
              item={item}
              active={is_active_path(item.href, pathname, lang)}
            />
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Én mobil-gruppe. Delt række (ingen dublering af top-linket):
 *  - Link-top → label'en navigerer, en separat chevron-knap folder dropdown'en
 *    ud. Så tap på pilen åbner altid (din gotcha), og labelen kan stadig klikkes.
 *  - Tekst-top (ingen side) → hele rækken er toggle-knappen.
 *  - Ingen dropdown → alm. menupunkt (link eller tekst).
 * Dropdown'en indeholder KUN under-linksene (top-linket gentages ikke).
 */
function MobileNavGroup({
  group,
  pathname,
  lang,
}: {
  group: NavGroup;
  pathname: string;
  lang?: string;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const { top, items } = group;

  if (items.length === 0) {
    return (
      <li>
        {top.kind === "link" ? (
          <MobileAnchor
            item={top}
            active={is_active_path(top.href, pathname, lang)}
          />
        ) : (
          <span className={cn(ROW, "cursor-default opacity-60")}>
            {top.label}
          </span>
        )}
      </li>
    );
  }

  const chevron = (
    <ChevronDown
      size={20}
      aria-hidden
      className={cn("shrink-0 transition-transform", open && "rotate-180")}
    />
  );

  if (top.kind === "text") {
    return (
      <li>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className={cn(ROW, "flex w-full cursor-pointer items-center justify-between")}
        >
          <span>{top.label}</span>
          {chevron}
        </button>
        {open ? (
          <Dropdown items={items} pathname={pathname} lang={lang} id={panelId} />
        ) : null}
      </li>
    );
  }

  return (
    <li>
      {/* Kun teksten navigerer; resten af rækken + pilen er toggle-knappen. */}
      <div className="flex items-stretch">
        <MobileAnchor
          item={top}
          active={is_active_path(top.href, pathname, lang)}
        />
        <button
          type="button"
          aria-label={top.label}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className={cn(ROW, "flex flex-1 cursor-pointer items-center justify-end")}
        >
          {chevron}
        </button>
      </div>
      {open ? (
        <Dropdown items={items} pathname={pathname} lang={lang} id={panelId} />
      ) : null}
    </li>
  );
}

export type NavGroupsMobileProps = { groups: NavGroup[]; lang?: string };

/**
 * Mobil-nav (i draweren): grupper med under-links foldes ud af en delt række
 * (label + separat chevron-knap). Keys = index + label: labels er ikke
 * garanteret unikke, så index sikrer entydighed.
 */
export function NavGroupsMobile({
  groups,
  lang,
}: NavGroupsMobileProps): React.ReactElement {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-1 text-lg">
      {groups.map((group, gi) => {
        const key = `${gi}-${group.top.label}`;
        return (
          <MobileNavGroup
            key={key}
            group={group}
            pathname={pathname}
            lang={lang}
          />
        );
      })}
    </ul>
  );
}
