import { type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import {
  LogoList,
  filled_logos,
} from "@/src/components/logos/parts/LogoList";
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
  const { theme, isHero, collapsePadding, eagerImages } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  // En overskrift uden logoer giver ingen mening for et logo-bånd.
  const logos = filled_logos(p.logos);
  if (logos.length === 0) return null;

  const align = resolve_heading_align(p.heading_align);

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="logos"
    >
      <EviHeadingGroup
        title={p.heading}
        description={p.body}
        linkResolver={linkResolver}
        isHero={isHero}
        align={align}
      />
      <EviRow>
        <LogoList
          items={logos}
          linkResolver={linkResolver}
          justify={align}
          eager={eagerImages}
        />
      </EviRow>
    </EviSection>
  );
}
