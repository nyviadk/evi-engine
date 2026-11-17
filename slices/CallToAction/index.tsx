import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { CallToActionCenteredLayout } from "@/src/components/call-to-action/parts/CallToActionCenteredLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * CallToAction — afsluttende opfordring. Tynd dispatcher på variation (R4.2).
 * "default" = centreret med valgfrit ikon og to knapper.
 */
export default function CallToAction({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.CallToActionSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return (
        <CallToActionCenteredLayout
          slice={slice}
          index={index}
          context={context}
        />
      );
    default:
      return null;
  }
}
