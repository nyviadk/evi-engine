import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { PlanioHeroLayout } from "@/src/components/planio/parts/PlanioHeroLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * PlanioHero — My Planios forside-hero (kun myplanio + evi-engine via
 * planio_-præfikset). Tynd dispatcher på variation (R4.2).
 */
export default function PlanioHero({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.PlanioHeroSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return <PlanioHeroLayout slice={slice} index={index} context={context} />;
    default:
      return null;
  }
}
