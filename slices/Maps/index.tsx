import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { MapsDefaultLayout } from "@/src/components/maps/parts/MapsDefaultLayout";
import { type EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * Maps — dispatcher (R4.2): vælger layout ud fra variation. Pt. kun "default".
 */
export default function Maps({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.MapsSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return (
        <MapsDefaultLayout slice={slice} index={index} context={context} />
      );
    default:
      return null;
  }
}
