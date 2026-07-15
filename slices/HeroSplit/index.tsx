import { isFilled, type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicNextLink } from "@prismicio/next";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviButton } from "@/src/components/ui/EviButton";
import { EviTag } from "@/src/components/ui/EviTag";
import { EviBackdropImage } from "@/src/components/ui/EviBackdropImage";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

// Prismic-label (backdrop) → EviBackdropImage-farve.
const BACKDROP: Record<string, "primary" | "secondary"> = {
  Primær: "primary",
  Sekundær: "secondary",
};

/**
 * HeroSplit — 2-kolonne hero. Venstre: tag + overskrift + brødtekst + CTA.
 * Højre: kvadratisk billede med blød, roteret farve-backdrop (dybde). Ren
 * Evi-composition; tag/backdrop er egne primitiver (EviTag, EviBackdropImage).
 */
export default function HeroSplit({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.HeroSplitSlice,
  EviPageSliceContext
>): React.ReactElement {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  const has_cta = isFilled.link(p.cta_link) && isFilled.keyText(p.cta_link.text);
  const backdrop = BACKDROP[p.backdrop ?? ""] ?? "secondary";

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="hero-split"
    >
      <EviSplit preset="50-50" align="center">
        <EviStack gap="lg" align="start">
          <EviTag
            icon={p.tag_icon}
            text={p.tag_text}
            linkResolver={linkResolver}
          />
          <EviHeadingGroup
            title={p.heading}
            description={p.body}
            linkResolver={linkResolver}
            isHero={isHero}
          />
          {has_cta && (
            <EviButton asChild variant="primary" appearance="solid" size="lg">
              <PrismicNextLink field={p.cta_link} linkResolver={linkResolver} />
            </EviButton>
          )}
        </EviStack>

        <EviBackdropImage
          field={p.image}
          backdrop={backdrop}
          priority={isHero}
        />
      </EviSplit>
    </EviSection>
  );
}
