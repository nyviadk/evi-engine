"use client";

import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

/**
 * Klient-ø der KUN holder hamburger-knappen og open/closed state.
 *
 * Selve link-listen rendres server-side og sendes ind som `children`.
 * Sådan undgår vi at bloate klient-bundlen med Prismic data, link-resolver
 * og hele listen — kun selve toggle-logikken er klient-kode.
 *
 * Container queries i Tailwind (@3xl/nav) bestemmer om navigationen vises
 * som hamburger (mobil, smal container) eller inline (desktop, bred container).
 * På desktop ignoreres `data-open` helt — CSS tvinger listen synlig.
 */
type Props = {
  children: ReactNode;
  panelId?: string;
  toggleLabel?: string;
};

export function EviNavigationDisclosure({
  children,
  panelId = "evi-nav-panel",
  toggleLabel = "Menu",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="@3xl/nav:hidden cursor-pointer inline-flex items-center justify-center rounded-evi p-2 text-current focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {open ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
        <span className="sr-only">{toggleLabel}</span>
      </button>
      <div id={panelId} data-open={open || undefined} className="evi-nav-panel">
        {children}
      </div>
    </>
  );
}
