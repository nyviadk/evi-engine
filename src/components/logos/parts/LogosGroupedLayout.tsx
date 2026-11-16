import { isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviRichText } from "@/src/components/typography/EviRichText";
import {
  LogoList,
  filled_logos,
} from "@/src/components/logos/parts/LogoList";
import { resolve_heading_align } from "@/src/lib/prismic/align";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

// Op til tre navngivne grupper (fast maks-antal = navngivne felter); kun
// grupper med logoer vises.
function get_groups(p: Content.LogosSliceGroupedPrimary) {
  return [
    { key: "1", title: p.group_1_title, logos: filled_logos(p.group_1_logos) },
    { key: "2", title: p.group_2_title, logos: filled_logos(p.group_2_logos) },
    { key: "3", title: p.group_3_title, logos: filled_logos(p.group_3_logos) },
  ].filter((group) => group.logos.length > 0);
}

export type LogosGroupedLayoutProps = {
  slice: Content.LogosSliceGrouped;
  index: number;
  context: EviPageSliceContext;
};

/**
 * Logos-variation "grouped": valgfri sektion-header og op til tre grupper med
 * hver sin titel ("Støttet af", "Rådgivet af") og logo-række. Fra md står
 * grupperne side om side adskilt af en lodret streg. Domain-part (Tailwind
 * tilladt, R3.3).
 */
export function LogosGroupedLayout({
  slice,
  index,
  context,
}: LogosGroupedLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding, eagerImages } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  const groups = get_groups(p);
  if (groups.length === 0) return null;

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
        {/* Stakket på mobil, én række uden ombrydning fra md (grupperne krymper,
            logoerne brydes inden i hver gruppe). Stregerne sættes ved samme
            breakpoint, så de aldrig står foran en gruppe på en ny linje. */}
        <EviStack
          rowFrom="md"
          align="start"
          justify={align}
          gap="xl"
          className="md:*:not-first:border-l md:*:not-first:border-current/10 md:*:not-first:pl-8"
        >
          {groups.map((group) => (
            <EviStack
              key={group.key}
              align={align}
              gap="sm"
              data-slot="logo-group"
            >
              {isFilled.richText(group.title) && (
                <EviRichText
                  field={group.title}
                  linkResolver={linkResolver}
                  className="[&_h3]:m-0 [&_h3]:text-sm [&_h3]:font-semibold"
                />
              )}
              <LogoList
                items={group.logos}
                linkResolver={linkResolver}
                justify={align}
                eager={eagerImages}
              />
            </EviStack>
          ))}
        </EviStack>
      </EviRow>
    </EviSection>
  );
}
