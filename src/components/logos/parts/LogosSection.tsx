import type {
  BooleanField,
  LinkResolverFunction,
  RichTextField,
} from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import type { SliceContext } from "@/src/lib/prismic/slices";

export type LogosSectionProps = {
  /** Felterne, begge variationer har. */
  p: { heading: RichTextField; body: RichTextField; hide_heading: BooleanField };
  sliceContext: Partial<SliceContext>;
  align: "start" | "center";
  linkResolver: LinkResolverFunction;
  children: React.ReactNode;
};

/**
 * Logos-sektionens ramme for begge variationer: sektionen, overskriften (skjult for
 * seende med hide_heading, men stadig læst op) og logoerne i fuld bredde.
 */
export function LogosSection({
  p,
  sliceContext,
  align,
  linkResolver,
  children,
}: LogosSectionProps): React.ReactElement {
  const { theme, isHero, collapsePadding } = sliceContext;

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
        className={p.hide_heading ? "sr-only" : undefined}
      />
      <EviRow>{children}</EviRow>
    </EviSection>
  );
}
