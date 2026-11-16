import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { PlanioDayLayout } from "@/src/components/planio/parts/PlanioDayLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * PlanioDay — "Sådan kan en onsdag se ud" som tidslinje (kun myplanio +
 * evi-engine via planio_-præfikset). Tynd dispatcher på variation (R4.2).
 */
export default function PlanioDay({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.PlanioDaySlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return <PlanioDayLayout slice={slice} index={index} context={context} />;
    default:
      return null;
  }
}
