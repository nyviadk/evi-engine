import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { PricesDefaultLayout } from "@/src/components/prices/parts/PricesDefaultLayout";
import { type EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * Prices — dispatcher (R4.2): vælger layout ud fra variation. Pt. kun "default".
 */
export default function Prices({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.PricesSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return (
        <PricesDefaultLayout slice={slice} index={index} context={context} />
      );
    default:
      return null;
  }
}
