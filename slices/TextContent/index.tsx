import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { TextContentDefaultLayout } from "@/src/components/text-content/parts/TextContentDefaultLayout";
import { TextContentDocumentLayout } from "@/src/components/text-content/parts/TextContentDocumentLayout";
import { type EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * TextContent — dispatcher (R4.2). "default" = intro + to tekst-kolonner,
 * "document" = ét langt dokument (fx privatlivspolitik).
 */
export default function TextContent({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.TextContentSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return (
        <TextContentDefaultLayout
          slice={slice}
          index={index}
          context={context}
        />
      );
    case "document":
      return (
        <TextContentDocumentLayout
          slice={slice}
          index={index}
          context={context}
        />
      );
    default:
      return null;
  }
}
