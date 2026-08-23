"use client";

import { type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { EviDrawer } from "@/src/components/ui/EviDrawer";
import { EviStack } from "@/src/components/layout/EviStack";

/**
 * Mobil hamburger-trigger + slide-in drawer til header-nav.
 *
 * Tynd komposition oven på EviDrawer-primitivet (native <dialog>): tilføjer
 * kun nav-specifikke ting (hamburger/X-ikoner, luk-knap, aria). Open/close,
 * focus-trap, Escape, inert baggrund + scroll-lock kommer fra EviDrawer.
 *
 * Trigger's synlighed styres af parent-clusteren (.evi-nav-mobile) — skjult på
 * desktop hvor nav'en vises inline. Delt mobil-collapse for header-varianter.
 */
export type MobileNavDrawerProps = {
  /** Drawer-indhold: nav-liste (+ evt. CTA i bunden via mt-auto). */
  children: ReactNode;
  /** Tilgængeligt navn på menuen. @default "Menu" */
  label?: string;
};

export function MobileNavDrawer({
  children,
  label = "Menu",
}: MobileNavDrawerProps): React.ReactElement {
  return (
    <EviDrawer.Provider>
      <EviDrawer.Trigger
        aria-label={`Åbn ${label.toLowerCase()}`}
        className="inline-flex cursor-pointer items-center justify-center rounded-evi p-2 text-current hover:bg-current/5 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Menu size={24} aria-hidden />
      </EviDrawer.Trigger>
      <EviDrawer.Panel aria-label={label}>
        <EviStack direction="row" justify="end" className="mb-2">
          <EviDrawer.Close
            aria-label={`Luk ${label.toLowerCase()}`}
            className="inline-flex cursor-pointer items-center justify-center rounded-evi p-2 text-current hover:bg-current/5 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X size={24} aria-hidden />
          </EviDrawer.Close>
        </EviStack>
        {children}
      </EviDrawer.Panel>
    </EviDrawer.Provider>
  );
}
