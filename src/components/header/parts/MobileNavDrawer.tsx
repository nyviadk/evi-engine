"use client";

import { type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { EviDrawer } from "@/src/components/ui/EviDrawer";

/**
 * Mobil hamburger-trigger + slide-in drawer til header-nav.
 *
 * Tynd komposition oven på EviDrawer-primitivet (native <dialog>): tilføjer
 * kun nav-specifikke ting (hamburger/X-ikoner, luk-knap, aria). Open/close,
 * focus-trap, Escape, inert baggrund + scroll-lock kommer fra EviDrawer.
 *
 * Trigger er skjult på desktop (@3xl/nav) — der vises nav'en inline i stedet.
 * Bruges af header-varianter som den delte mobil-collapse.
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
        className="inline-flex cursor-pointer items-center justify-center rounded-evi p-2 text-current hover:bg-current/5 focus-visible:outline-2 focus-visible:outline-offset-2 @3xl/nav:hidden"
      >
        <Menu size={24} aria-hidden />
      </EviDrawer.Trigger>
      <EviDrawer.Panel aria-label={label}>
        <div className="mb-2 flex justify-end">
          <EviDrawer.Close
            aria-label={`Luk ${label.toLowerCase()}`}
            className="inline-flex cursor-pointer items-center justify-center rounded-evi p-2 text-current hover:bg-current/5 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X size={24} aria-hidden />
          </EviDrawer.Close>
        </div>
        {children}
      </EviDrawer.Panel>
    </EviDrawer.Provider>
  );
}
