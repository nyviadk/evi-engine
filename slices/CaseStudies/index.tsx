import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { CaseStudiesDefaultLayout } from "@/src/components/case-studies/parts/CaseStudiesDefaultLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * CaseStudies — tynd dispatcher (R4.2). "default" = repeatable liste af cases,
 * hver med billede, titel, beskrivelse, en meta-tabel (label · værdi) og et
 * valgfrit "læs mere"-link til en underside.
 */
export default function CaseStudies({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.CaseStudiesSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  switch (slice.variation) {
    case "default":
      return (
        <CaseStudiesDefaultLayout
          slice={slice}
          index={index}
          context={context}
        />
      );
    default:
      return null;
  }
}
