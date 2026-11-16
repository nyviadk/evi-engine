import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { PlanioCustomizeLayout } from "@/src/components/planio/parts/PlanioCustomizeLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * PlanioCustomize — "Gør appen til din" med farvevælger, energi-enheder og
 * indstillinger (kun myplanio + evi-engine via planio_-præfikset). Tynd
 * dispatcher på variation (R4.2).
 */
export default function PlanioCustomize({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.PlanioCustomizeSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return <PlanioCustomizeLayout slice={slice} index={index} context={context} />;
    default:
      return null;
  }
}
