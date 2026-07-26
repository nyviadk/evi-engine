import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { TextWithImagesDefaultLayout } from "@/src/components/text-with-images/parts/TextWithImagesDefaultLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * TextWithImages — tynd dispatcher (R4.2). "default" = simpel billede+tekst-
 * sektion: overskrift + brødtekst i den ene kolonne, rammet billede i den anden.
 */
export default function TextWithImages({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.TextWithImagesSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return (
        <TextWithImagesDefaultLayout
          slice={slice}
          index={index}
          context={context}
        />
      );
    default:
      return null;
  }
}
