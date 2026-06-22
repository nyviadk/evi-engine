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
 * På desktop ignoreres `data-state` helt — CSS tvinger listen synlig.
 *
 * `data-state="open" | "closed"` følger Radix-konventionen så fremtidige
 * primitiver kan dele samme selector-mønster.
 */
export type EviNavigationDisclosureProps = {
  children: ReactNode;
  panelId?: string;
  toggleLabel?: string;
};

export function EviNavigationDisclosure({
  children,
  panelId = "evi-nav-panel",
  toggleLabel = "Menu",
}: EviNavigationDisclosureProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const state = open ? "open" : "closed";

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        data-state={state}
        onClick={() => setOpen((o) => !o)}
        className="@3xl/nav:hidden inline-flex cursor-pointer items-center justify-center rounded-evi p-2 text-current focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {open ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
        <span className="sr-only">{toggleLabel}</span>
      </button>
      <div
        id={panelId}
        data-slot="evi-nav-panel"
        data-state={state}
        className="evi-nav-panel"
      >
        {children}
      </div>
    </>
  );
}
