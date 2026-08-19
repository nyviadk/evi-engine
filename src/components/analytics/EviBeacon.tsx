"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Tæller interne soft-navigationer (klik på <Link>) som serveren ikke kan se
 * pålideligt (RSC-fetches uden brugbart prefetch-signal). Fyrer KUN ved ægte
 * route-skift — en prefetch ændrer ikke URL'en, så `usePathname` skifter ikke,
 * og beaconen fyrer aldrig på prefetch. Første render = den hårde navigation
 * (allerede talt server-side) → springes over, så intet tælles dobbelt.
 *
 * sendBeacon → same-origin `/api/evi/sync` (first-party, ad-block-resistent);
 * `from` er den forrige sti (til aggregeret flow). Ingen cookie, ingen PII.
 */
export function EviBeacon({ locale }: { locale: string }): null {
  const pathname = usePathname();
  const prev = useRef<string | null>(null);

  useEffect(() => {
    const from = prev.current;
    prev.current = pathname;
    if (from === null) return; // første load = hård nav, talt server-side

    const body = JSON.stringify({ p: pathname, from, l: locale });
    navigator.sendBeacon(
      "/api/evi/sync",
      new Blob([body], { type: "application/json" }),
    );
  }, [pathname, locale]);

  return null;
}
