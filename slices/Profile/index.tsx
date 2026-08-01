import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { ProfileDefaultLayout } from "@/src/components/profile/parts/ProfileDefaultLayout";
import { type EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * Profile — dispatcher (R4.2): personlig hilsen med portræt + signatur. Pt. kun
 * "default".
 */
export default function Profile({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.ProfileSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return (
        <ProfileDefaultLayout slice={slice} index={index} context={context} />
      );
    default:
      return null;
  }
}
