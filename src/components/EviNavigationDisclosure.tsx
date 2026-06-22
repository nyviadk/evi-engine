"use client";

import { use, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import {
  EviDisclosure,
  EviDisclosureContext,
} from "@/src/components/ui/EviDisclosure";

/**
 * Mobil hamburger-trigger + nav-panel.
 *
 * Tynd orchestration oven på EviDisclosure-primitiven: tilføjer bare det
 * navigation-specifikke (icon-swap, sr-only label, panel-styling). Selve
 * open/closed-state, aria-wiring og context-eksponering håndteres af
 * EviDisclosure.
 *
 * Container queries i Tailwind (@3xl/nav) bestemmer om navigationen vises
 * som hamburger (mobil, smal container) eller inline (desktop, bred
 * container). På desktop ignoreres [data-state] helt — CSS tvinger
 * listen synlig via container-query reglerne i globals.css.
 */

/** Læser åben/lukket fra context og rendrer det rigtige hamburger-ikon. */
function HamburgerIcon(): React.ReactElement {
  const ctx = use(EviDisclosureContext);
  const open = ctx?.state.open ?? false;
  return open ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />;
}

export type EviNavigationDisclosureProps = {
  children: ReactNode;
  toggleLabel?: string;
};

export function EviNavigationDisclosure({
  children,
  toggleLabel = "Menu",
}: EviNavigationDisclosureProps): React.ReactElement {
  return (
    <EviDisclosure.Provider>
      <EviDisclosure.Trigger className="@3xl/nav:hidden inline-flex cursor-pointer items-center justify-center rounded-evi p-2 text-current focus-visible:outline-2 focus-visible:outline-offset-2">
        <HamburgerIcon />
        <span className="sr-only">{toggleLabel}</span>
      </EviDisclosure.Trigger>
      <EviDisclosure.Panel className="evi-nav-panel">
        {children}
      </EviDisclosure.Panel>
    </EviDisclosure.Provider>
  );
}
