import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { FaqAccordionLayout } from "@/src/components/faq/parts/FaqAccordionLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * Faq — FAQ-sektion. Tynd dispatcher på variation (R4.2). "default" =
 * enkelt-kolonne accordion (native <details>) med sektion-header + valgfri CTA.
 */
export default function Faq({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.FaqSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return (
        <FaqAccordionLayout slice={slice} index={index} context={context} />
      );
    default:
      return null;
  }
}
