import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { PlanioAboutLayout } from "@/src/components/planio/parts/PlanioAboutLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * PlanioAbout — "Om os": overskrift, tekst og et foto under My Planios
 * stjernehimmel (kun myplanio + evi-engine via planio_-præfikset). Tynd
 * dispatcher på variation (R4.2).
 */
export default function PlanioAbout({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.PlanioAboutSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return <PlanioAboutLayout slice={slice} index={index} context={context} />;
    default:
      return null;
  }
}
