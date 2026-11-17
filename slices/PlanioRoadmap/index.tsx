import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { PlanioRoadmapLayout } from "@/src/components/planio/parts/PlanioRoadmapLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * PlanioRoadmap — "Det her er kun begyndelsen": appens køreplan som trin på en
 * stiplet linje (kun myplanio + evi-engine via planio_-præfikset). Tynd
 * dispatcher på variation (R4.2).
 */
export default function PlanioRoadmap({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.PlanioRoadmapSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return <PlanioRoadmapLayout slice={slice} index={index} context={context} />;
    default:
      return null;
  }
}
