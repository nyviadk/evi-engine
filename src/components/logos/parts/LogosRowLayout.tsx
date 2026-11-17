import { type Content } from "@prismicio/client";

import {
  LogoList,
  filled_logos,
} from "@/src/components/logos/parts/LogoList";
import { LogosSection } from "@/src/components/logos/parts/LogosSection";
import { resolve_heading_align } from "@/src/lib/prismic/align";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

export type LogosRowLayoutProps = {
  slice: Content.LogosSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

/**
 * Logos-variation "default": valgfri sektion-header og én række logoer
 * ("Kendt fra", "Samarbejdspartnere"). Domain-part (Tailwind tilladt, R3.3).
 */
export function LogosRowLayout({
  slice,
  index,
  context,
}: LogosRowLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const slice_context = resolve_slice_context(context, index);
  const p = slice.primary;

  // En overskrift uden logoer giver ingen mening for et logo-bånd.
  const logos = filled_logos(p.logos);
  if (logos.length === 0) return null;

  const align = resolve_heading_align(p.heading_align);

  return (
    <LogosSection
      p={p}
      sliceContext={slice_context}
      align={align}
      linkResolver={linkResolver}
    >
      <LogoList
        items={logos}
        linkResolver={linkResolver}
        justify={align}
        eager={slice_context.eagerImages}
      />
    </LogosSection>
  );
}
