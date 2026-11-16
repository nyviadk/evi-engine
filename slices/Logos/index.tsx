import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { LogosRowLayout } from "@/src/components/logos/parts/LogosRowLayout";
import { LogosGroupedLayout } from "@/src/components/logos/parts/LogosGroupedLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * Logos — logo-bånd. Tynd dispatcher på variation (R4.2). "default" = én række
 * logoer, "grouped" = op til tre titlede grupper side om side.
 */
export default function Logos({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.LogosSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return <LogosRowLayout slice={slice} index={index} context={context} />;
    case "grouped":
      return (
        <LogosGroupedLayout slice={slice} index={index} context={context} />
      );
    default:
      return null;
  }
}
