import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import type { EviHeaderSliceContext } from "@/src/components/header/types";
import { PlanioHeaderLayout } from "@/src/components/planio/parts/PlanioHeaderLayout";

/**
 * planio_header — My Planios header med logo-forvandlingen. Tynd dispatcher på
 * variation (R4.2).
 */
export default function PlanioHeader({
  slice,
  context,
}: SliceComponentProps<
  Content.PlanioHeaderSlice,
  EviHeaderSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return <PlanioHeaderLayout slice={slice} context={context} />;
    default:
      return null;
  }
}
