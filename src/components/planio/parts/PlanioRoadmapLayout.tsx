import { isFilled, type Content } from "@prismicio/client";

import { EviAutoGrid } from "@/src/components/layout/EviAutoGrid";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviTitle } from "@/src/components/typography/EviTitle";
import { EviCard } from "@/src/components/ui/EviCard";
import { EviTag } from "@/src/components/ui/EviTag";
import { PlanioSky, type PlanioSkyStar } from "@/src/components/planio/PlanioSky";
import { PlanioStar } from "@/src/components/planio/PlanioStar";
import { has_rich_text } from "@/src/lib/prismic/fields";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { evi_card_body_class } from "@/src/lib/utils/card-text";
import { cn } from "@/src/lib/utils/cn";

// De øverste stjerner står med faste afstande i sektionens top-luft: i procent
// rykkede de ned i overskriften, når sektionen blev høj på mobil.
const STARS: PlanioSkyStar[] = [
  { position: "left-[4%] top-12" },
  { position: "left-[46%] top-9", big: true },
  { position: "left-[91%] top-18" },
  { position: "left-[96%] top-[48%]", wide: true },
  { position: "left-[3%] top-[56%]", big: true, wide: true },
];

export type PlanioRoadmapLayoutProps = {
  slice: Content.PlanioRoadmapSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

/**
 * planio_roadmap "default": "Det her er kun begyndelsen". Bygget som Evis
 * features "cards": trinene er EviCards i et trio-gitter, med stjernen som ikon.
 */
export function PlanioRoadmapLayout({
  slice,
  index,
  context,
}: PlanioRoadmapLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(context, index);
  const p = slice.primary;

  // Kun trin med titel eller tekst; et mærkat alene siger ingenting.
  const steps = (p.steps ?? []).filter((step) => has_rich_text(step.title, step.body));
  if (!has_rich_text(p.heading, p.body) && steps.length === 0) return null;

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      className="relative overflow-hidden"
      data-slot="planio-roadmap-section"
    >
      <PlanioSky stars={STARS} />
      <EviHeadingGroup
        title={p.heading}
        description={p.body}
        linkResolver={linkResolver}
        isHero={isHero}
      />
      {steps.length > 0 && (
        <EviAutoGrid as="ol" size="trio">
          {steps.map((step, i) => (
            <EviCard key={i} as="li" rows={4}>
              <PlanioStar
                variant={step.current ? "filled" : "outline"}
                className={cn("size-8", step.current && "text-evi-primary")}
              />
              {isFilled.richText(step.tag) ? (
                <EviTag
                  text={step.tag}
                  // Udeladt flade = EviTags lyse primær-flade, så det, appen kan i dag,
                  // står frem mod de neutrale "Senere".
                  surface={step.current ? undefined : "Neutral"}
                  linkResolver={linkResolver}
                  className="mt-4"
                />
              ) : (
                <div />
              )}
              {isFilled.richText(step.title) ? (
                <EviTitle
                  field={step.title}
                  linkResolver={linkResolver}
                  size="xl"
                  className="mt-2"
                />
              ) : (
                <div />
              )}
              {isFilled.richText(step.body) ? (
                <EviRichText
                  field={step.body}
                  linkResolver={linkResolver}
                  className={cn("mt-2", evi_card_body_class())}
                />
              ) : (
                <div />
              )}
            </EviCard>
          ))}
        </EviAutoGrid>
      )}
    </EviSection>
  );
}
