"use client";

import { prevent_double_click_select } from "@/src/lib/utils/selection";

/**
 * `<summary>` som klient-komponent KUN for at neutralisere browserens
 * dobbeltklik-ordmarkering (flimrer ved åbn/luk). Toggle sker på `click`
 * → uberørt. Ren progressiv enhancement (native uden JS).
 */
export function EviAccordionSummary({
  className,
  children,
  ...props
}: React.ComponentProps<"summary">): React.ReactElement {
  return (
    <summary
      onMouseDown={prevent_double_click_select}
      className={className}
      {...props}
    >
      {children}
    </summary>
  );
}
