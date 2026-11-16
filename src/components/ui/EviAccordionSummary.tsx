"use client";

import {
  ignore_click_after_text_select,
  prevent_double_click_select,
} from "@/src/lib/utils/selection";

/**
 * `<summary>` som klient-komponent KUN for tekstmarkering: ingen ordmarkering
 * ved dobbeltklik (flimrer ved åbn/luk), og træk-markering af spørgsmålet
 * (for at kopiere) åbner/lukker ikke. Ren progressiv enhancement (native uden JS).
 */
export function EviAccordionSummary({
  className,
  children,
  ...props
}: React.ComponentProps<"summary">): React.ReactElement {
  return (
    <summary
      onMouseDown={prevent_double_click_select}
      onClick={ignore_click_after_text_select}
      className={className}
      {...props}
    >
      {children}
    </summary>
  );
}
