import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { VideoDefaultLayout } from "@/src/components/video/parts/VideoDefaultLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * Video — lydløs video i loop, fx en forklarende video. Tynd dispatcher på
 * variation (R4.2). "default" = overskrift over videoen, udskrift under.
 */
export default function Video({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.VideoSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return <VideoDefaultLayout slice={slice} index={index} context={context} />;
    default:
      return null;
  }
}
