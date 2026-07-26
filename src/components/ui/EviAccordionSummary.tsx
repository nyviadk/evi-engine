"use client";

/**
 * `<summary>` som klient-komponent KUN for at neutralisere browserens
 * dobbeltklik-ordmarkering (flimrer ved åbn/luk). `preventDefault` kun ved
 * `detail > 1`, så single-klik + træk-markering bevares; toggle sker på `click`
 * → uberørt. Ren progressiv enhancement (native uden JS).
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
