import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { FeaturesColumnsLayout } from "@/src/components/features/parts/FeaturesColumnsLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * SectionFeatures — trust-bar med ikon+tekst-kolonner. Tynd dispatcher på
 * variation (R4.2); hver variation = én layout-part i features/parts/.
 */
export default function SectionFeatures({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.SectionFeaturesSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return (
        <FeaturesColumnsLayout slice={slice} index={index} context={context} />
      );
    default:
      return null;
  }
}
