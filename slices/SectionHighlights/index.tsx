import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { HighlightsLayout } from "@/src/components/highlights/parts/HighlightsLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * SectionHighlights — tynd dispatcher (R4.2). "default" = intro (titel +
 * brødtekst) venstre, ikon-punkt-boks højre (centreret mod brødteksten).
 */
export default function SectionHighlights({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.SectionHighlightsSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return (
        <HighlightsLayout slice={slice} index={index} context={context} />
      );
    default:
      return null;
  }
}
