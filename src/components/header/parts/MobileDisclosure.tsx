"use client";

import { use, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import {
  EviDisclosure,
  EviDisclosureContext,
} from "@/src/components/ui/EviDisclosure";

/**
 * Mobile hamburger trigger + nav panel.
 *
 * Thin orchestration on top of the EviDisclosure primitive: adds only the
 * navigation-specific bits (icon swap, sr-only label, panel styling). Open/
 * closed state, aria wiring, and context exposure are handled by EviDisclosure.
 *
 * Container queries (@3xl/nav) decide whether nav shows as a hamburger
 * (mobile / narrow container) or inline (desktop / wide container). On
 * desktop [data-state] is ignored — CSS in globals.css forces the list
 * visible via container-query rules.
 *
 * Used by every header variant (Classic, Centered, etc.) as the shared
 * mobile-collapse primitive.
 */

function HamburgerIcon(): React.ReactElement {
  const ctx = use(EviDisclosureContext);
  const open = ctx?.state.open ?? false;
  return open ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />;
}

export type MobileDisclosureProps = {
  children: ReactNode;
  toggleLabel?: string;
};

export function MobileDisclosure({
  children,
  toggleLabel = "Menu",
}: MobileDisclosureProps): React.ReactElement {
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
