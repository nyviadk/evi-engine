import Link from "next/link";

import { cn } from "@/src/lib/utils/cn";
import type { NavLink } from "@/src/components/header/parts/navGroups";

const NAV_ACTIVE =
  "font-semibold underline decoration-2 underline-offset-4";

/**
 * Delt nav-anker for desktop + mobil. Eksterne links → `<a>` (target/rel
 * bevaret); interne → next `<Link>` (aria-current). Basis-klassen (række-højde
 * mv.) sendes via `className`, så de to renderere kan have hver sin padding.
 * `children` lader desktop lægge en chevron ind i ankeret; udelades den, vises
 * `item.label`.
 */
export function NavAnchor({
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
  const cls = cn(className, active && NAV_ACTIVE);
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
