import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { GalleryDefaultLayout } from "@/src/components/gallery/parts/GalleryDefaultLayout";
import { type EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * Gallery — dispatcher (R4.2): vælger layout ud fra variation. Pt. kun "default".
 */
export default function Gallery({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.GallerySlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return (
        <GalleryDefaultLayout slice={slice} index={index} context={context} />
      );
    default:
      return null;
  }
}
