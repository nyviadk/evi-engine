"use client";

import { useState } from "react";

import { EviButton } from "@/src/components/ui/EviButton";

export type TestimonialsRevealProps = {
  /** Server-rendrede kort (en `EviMasonry` med alle `EviBox`'e). */
  children: React.ReactNode;
  /** Knap-tekst (Prismic `more_label`, sprog-korrekt pr. locale). */
  moreLabel: string;
};

/**
 * Slicens eneste client-JS: én boolean. Al tung rich-text rendres på serveren og
 * sendes ind som children — kun toggle'en hydreres. Folder de skjulte kort ud på
 * mobil (desktop viser altid alt). "Kun mobil + uden CLS" KRÆVER JS: ingen native
 * disclosure kan styres af skærmbredde i ren CSS (verificeret mod docs 2026).
 * Progressive enhancement: uden JS afslører layoutets <noscript> alt + skjuler
 * knappen — så intet indhold låses inde.
 */
export function TestimonialsReveal({
  children,
  moreLabel,
}: TestimonialsRevealProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    // Grupperer masonry + knap i ÉT grid-item, så sektionens gap-y ikke lægger
    // sig mellem listen og dens egen "vis flere"-knap (knappen skal hugge
    // listen). group/data-open folder de skjulte kort ud.
    <div data-open={open || undefined} className="group/reveal col-span-12">
      {children}
      <div
        data-slot="testimonials-more"
        className="mt-2 flex justify-center group-data-open/reveal:hidden md:hidden"
      >
        <EviButton
          type="button"
          variant="primary"
          appearance="outline"
          onClick={() => setOpen(true)}
        >
          {moreLabel}
        </EviButton>
      </div>
    </div>
  );
}
