import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { TestimonialsLayout } from "@/src/components/testimonials/parts/TestimonialsLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * Testimonials — tynd dispatcher (R4.2). "default" = centreret intro + en
 * masonry-væg af anmeldelses-kort (kolonne-flow, per-kasse-farve, vis-flere
 * på mobil).
 */
export default function Testimonials({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.TestimonialsSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return (
        <TestimonialsLayout slice={slice} index={index} context={context} />
      );
    default:
      return null;
  }
}
