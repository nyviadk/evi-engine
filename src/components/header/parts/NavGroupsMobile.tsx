"use client";

import { useId, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { cn } from "@/src/lib/utils/cn";
import { EviStack } from "@/src/components/layout/EviStack";
import { is_active_path } from "@/src/components/header/parts/navActive";
import { NavAnchor } from "@/src/components/header/parts/NavAnchor";
import type {
  NavGroup,
  NavLink,
} from "@/src/components/header/parts/navGroups";

const ROW =
  "block rounded-evi px-3 py-3 text-current no-underline hover:bg-current/5 focus-visible:outline-2 focus-visible:outline-offset-2";

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
    <EviStack
      as="ul"
      id={id}
      gap="xs"
      className="mt-1 ml-4 border-l border-current/20 pl-4 text-base"
    >
      {items.map((item, ii) => {
        return (
          <li key={ii}>
            <NavAnchor
              item={item}
              active={is_active_path(item.href, pathname, lang)}
              className={ROW}
            />
          </li>
        );
      })}
    </EviStack>
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
          <NavAnchor
            item={top}
            active={is_active_path(top.href, pathname, lang)}
            className={ROW}
          />
        ) : (
          <span className={cn(ROW, "cursor-default")}>
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
        <EviStack
          as="button"
          direction="row"
          align="center"
          justify="between"
          gap="xs"
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className={cn(ROW, "w-full cursor-pointer")}
        >
          <span>{top.label}</span>
          {chevron}
        </EviStack>
        {open && (
          <Dropdown items={items} pathname={pathname} lang={lang} id={panelId} />
        )}
      </li>
    );
  }

  return (
    <li>
      {/* Kun teksten navigerer; resten af rækken + pilen er toggle-knappen. */}
      <EviStack direction="row" align="stretch" gap="xs">
        <NavAnchor
          item={top}
          active={is_active_path(top.href, pathname, lang)}
          className={ROW}
        />
        <EviStack
          as="button"
          direction="row"
          align="center"
          justify="end"
          type="button"
          aria-label={top.label}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className={cn(ROW, "flex-1 cursor-pointer")}
        >
          {chevron}
        </EviStack>
      </EviStack>
      {open && (
        <Dropdown items={items} pathname={pathname} lang={lang} id={panelId} />
      )}
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
    <EviStack as="ul" gap="xs" className="text-lg">
      {groups.map((group, gi) => {
        return (
          <MobileNavGroup
            key={gi}
            group={group}
            pathname={pathname}
            lang={lang}
          />
        );
      })}
    </EviStack>
  );
}
