"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils/cn";

/** Server-resolveret nav-punkt — kun serialiserbare felter (ingen funktioner),
 *  så det kan krydse server→klient-grænsen. */
export type NavLinkItem = {
  href: string;
  label: string;
  /** Eksternt link (ikke en intern app-sti) → aldrig aktivt, rendres som <a>. */
  external: boolean;
  target?: string;
  rel?: string;
};

export type NavLinksProps = {
  items: NavLinkItem[];
  /**
   * Nuværende locale. `usePathname()` giver den OFFENTLIGE URL, som for
   * default-sproget er præfiks-løs (matcher linkResolver) — men vi stripper
   * `/<lang>` fra begge sider som sikkerhedsnet, hvis stien skulle være præfikset.
   */
  lang?: string;
  className?: string;
  itemClassName?: string;
};

/** Sti uden query/hash og uden efterstillet skråstreg (roden forbliver "/"). */
function normalize_path(path: string): string {
  const trimmed = (path.split(/[?#]/)[0] ?? path).replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/** Fjern ledende `/<lang>`-segment, så en evt. præfikset sti og et præfiks-løst
 *  link lander i samme sti-rum. */
function strip_locale(path: string, lang?: string): string {
  if (!lang) return path;
  if (path === `/${lang}`) return "/";
  if (path.startsWith(`/${lang}/`)) return path.slice(lang.length + 1);
  return path;
}

/**
 * Er dette link den aktuelle side? Eksakt match, ELLER en undersides
 * sektions-link (fx `/produkter` markeres på `/produkter/kaffe`). Home ("/")
 * matcher kun eksakt — ellers ville den lyse op på hver side.
 */
function is_active_path(href: string, current: string, lang?: string): boolean {
  const h = strip_locale(normalize_path(href), lang);
  const c = strip_locale(normalize_path(current), lang);
  return h === c || (h !== "/" && c.startsWith(`${h}/`));
}

const BASE_ITEM =
  "block rounded-evi px-3 py-2 text-current no-underline hover:bg-current/5 focus-visible:outline-2 focus-visible:outline-offset-2";
const ACTIVE_ITEM = "font-semibold underline decoration-2 underline-offset-4";

/**
 * Klient-side nav-liste: markerer det aktive link ("du er her") ud fra
 * `usePathname()`, så det opdateres ved soft-navigation — ikke kun ved reload
 * (root-layoutet/headeren re-renderes IKKE server-side ved App Router-navigation).
 */
export function NavLinks({
  items,
  lang,
  className,
  itemClassName,
}: NavLinksProps): React.ReactElement {
  const pathname = usePathname();

  return (
    <ul className={cn("evi-nav-list", className)}>
      {items.map((item, i) => {
        const active = !item.external && is_active_path(item.href, pathname, lang);
        const linkClass = cn(BASE_ITEM, active && ACTIVE_ITEM, itemClassName);
        const itemKey = `${i}-${item.href}`;
        return (
          <li key={itemKey}>
            {item.external ? (
              <a
                href={item.href}
                target={item.target}
                rel={item.rel}
                className={linkClass}
              >
                {item.label}
              </a>
            ) : (
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={linkClass}
              >
                {item.label}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
