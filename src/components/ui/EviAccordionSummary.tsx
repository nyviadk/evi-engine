"use client";

/**
 * Accordion-overskriften (`<summary>`) som en tynd klient-komponent — KUN for at
 * neutralisere dobbeltklik-tekstmarkering. Et `<summary>` markerer normalt ordet
 * ved dobbeltklik (browser-default), hvilket "flimrer" når man bare vil åbne/lukke.
 *
 * `preventDefault` KUN ved `detail > 1` (dobbelt/tripel-klik) dræber ord-markeringen,
 * men lader single-klik + træk-markering være i fred → man kan stadig markere teksten
 * manuelt. Toggle udløses af `click` (ikke `mousedown`) → helt uberørt. Uden JS
 * (før hydrering) fungerer alt native; handleren er ren progressiv enhancement.
 */
export function EviAccordionSummary({
  className,
  children,
  ...props
}: React.ComponentProps<"summary">): React.ReactElement {
  return (
    <summary
      onMouseDown={(e) => {
        if (e.detail > 1) e.preventDefault();
      }}
      className={className}
      {...props}
    >
      {children}
    </summary>
  );
}
