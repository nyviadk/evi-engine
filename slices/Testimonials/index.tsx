import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { TestimonialsLayout } from "@/src/components/testimonials/parts/TestimonialsLayout";
import { TestimonialsCarouselLayout } from "@/src/components/testimonials/parts/TestimonialsCarouselLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * Testimonials — tynd dispatcher (R4.2). "default" = masonry-væg af anmeldelses-
 * kort; "carousel" = ét citat ad gangen med pile/dots/pil-taster.
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
    case "carousel":
      return (
        <TestimonialsCarouselLayout
          slice={slice}
          index={index}
          context={context}
        />
      );
    default:
      return null;
  }
}
