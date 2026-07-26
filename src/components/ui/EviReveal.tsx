"use client";

import { useState } from "react";

import { cn } from "@/src/lib/utils/cn";
import { EviButton } from "@/src/components/ui/EviButton";

export type EviRevealProps = {
  /** Server-rendrede børn (hele listen). */
  children: React.ReactNode;
  /** Knap-tekst (Prismic, sprog-korrekt pr. locale). */
  label: string;
  /**
   * Ekstra klasser på knap-wrapperen — fx `md:hidden` for kun-mobil-reveal
   * (desktop viser altid alt). Udeladt = knappen vises på alle breakpoints.
   */
  moreClassName?: string;
};

/**
 * Delt "vis resten"-reveal: slicens eneste client-JS er én boolean; al tung
 * rendering sker på serveren og sendes ind som children.
 *
 * Kalderen markerer de OVERSKYDENDE elementer med `data-reveal-overflow` + en
 * skjul-klasse styret af `group-data-open/reveal`:
 *  - alle breakpoints: `hidden group-data-open/reveal:block`
 *  - kun mobil: `max-md:hidden group-data-open/reveal:max-md:block` + `moreClassName="md:hidden"`
 *
 * "Skærmbredde-styret + uden CLS" KRÆVER JS. PE via `<noscript>`: uden JS afsløres
 * alt overskydende + knappen skjules.
 */
export function EviReveal({
  children,
  label,
  moreClassName,
}: EviRevealProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    // Grupperer liste + knap i ÉT grid-item, så sektionens gap-y ikke lægger sig
    // mellem listen og dens egen knap (knappen skal hugge listen).
    <div data-open={open || undefined} className="group/reveal col-span-12">
      {children}
      <div
        data-slot="evi-reveal-more"
        className={cn(
          "mt-2 flex justify-center group-data-open/reveal:hidden",
          moreClassName,
        )}
      >
        <EviButton
          type="button"
          variant="primary"
          appearance="outline"
          onClick={() => setOpen(true)}
        >
          {label}
        </EviButton>
      </div>
      {/* PE: uden JS afsløres de skjulte + den døde knap skjules (CSP tillader
          inline style i noscript). Med JS overtager toggle'en. */}
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<style>[data-reveal-overflow]{display:block!important}[data-slot="evi-reveal-more"]{display:none!important}</style>`,
        }}
      />
    </div>
  );
}
