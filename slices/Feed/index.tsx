import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { FeedDefaultLayout } from "@/src/components/feed/parts/FeedDefaultLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * Feed — oversigt over en sides undersider som kort (artikler, nyheder,
 * guides). Tynd dispatcher på variation (R4.2).
 */
export default function Feed({
  slice,
  index,
  context,
}: SliceComponentProps<Content.FeedSlice, EviPageSliceContext>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return <FeedDefaultLayout slice={slice} index={index} context={context} />;
    default:
      return null;
  }
}
