import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { ReleaseNotesDefaultLayout } from "@/src/components/release-notes/parts/ReleaseNotesDefaultLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * ReleaseNotes — udgivelser/ændringslog. Tynd dispatcher på variation (R4.2).
 * "default" = accordion med nyeste udgivelse øverst og åben.
 */
export default function ReleaseNotes({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.ReleaseNotesSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return (
        <ReleaseNotesDefaultLayout
          slice={slice}
          index={index}
          context={context}
        />
      );
    default:
      return null;
  }
}
