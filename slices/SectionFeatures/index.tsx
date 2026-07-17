import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { FeaturesColumnsLayout } from "@/src/components/features/parts/FeaturesColumnsLayout";
import { FeaturesCardsLayout } from "@/src/components/features/parts/FeaturesCardsLayout";
import { FeaturesSplitLayout } from "@/src/components/features/parts/FeaturesSplitLayout";
import { FeaturesBentoLayout } from "@/src/components/features/parts/FeaturesBentoLayout";
import { FeaturesIconBentoLayout } from "@/src/components/features/parts/FeaturesIconBentoLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * SectionFeatures — Features-kategori. Tynd dispatcher på variation (R4.2);
 * hver variation = én layout-part i features/parts/. "default" = trust-bar
 * (ikon+tekst-kolonner), "cards" = overskrift + repeatable kort-grid, "split" =
 * billede + vertikal boks-liste, "bento" = 4-kasse bento-gitter (billeder),
 * "icon-bento" = asymmetrisk 2×2 bento med ikon-kasser.
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
    case "cards":
      return (
        <FeaturesCardsLayout slice={slice} index={index} context={context} />
      );
    case "split":
      return (
        <FeaturesSplitLayout slice={slice} index={index} context={context} />
      );
    case "bento":
      return (
        <FeaturesBentoLayout slice={slice} index={index} context={context} />
      );
    case "icon-bento":
      return (
        <FeaturesIconBentoLayout slice={slice} index={index} context={context} />
      );
    default:
      return null;
  }
}
