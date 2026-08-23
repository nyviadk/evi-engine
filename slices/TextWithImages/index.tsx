import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { TextWithImagesDefaultLayout } from "@/src/components/text-with-images/parts/TextWithImagesDefaultLayout";
import { TextWithImagesCollageLayout } from "@/src/components/text-with-images/parts/TextWithImagesCollageLayout";
import { TextWithImagesDuoLayout } from "@/src/components/text-with-images/parts/TextWithImagesDuoLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * TextWithImages — tynd dispatcher (R4.2). Tekst + billede(r) side om side:
 * - "default": ét rammet billede + tekst.
 * - "collage": forskudt klynge af 4 billeder + tekst (lodret centreret).
 * - "duo": to billeder i forskellig højde + tekst.
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
    case "collage":
      return (
        <TextWithImagesCollageLayout
          slice={slice}
          index={index}
          context={context}
        />
      );
    case "duo":
      return (
        <TextWithImagesDuoLayout
          slice={slice}
          index={index}
          context={context}
        />
      );
    default:
      return null;
  }
}
