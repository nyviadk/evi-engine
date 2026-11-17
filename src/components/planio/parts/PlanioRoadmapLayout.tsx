import { isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviTitle } from "@/src/components/typography/EviTitle";
import { EviTag } from "@/src/components/ui/EviTag";
import { PlanioHeader } from "@/src/components/planio/PlanioHeader";
import { PlanioRoadmap } from "@/src/components/planio/PlanioRoadmap";
import { PlanioSky, type PlanioSkyStar } from "@/src/components/planio/PlanioSky";
import { has_rich_text } from "@/src/lib/prismic/fields";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { evi_card_body_class } from "@/src/lib/utils/card-text";
import { cn } from "@/src/lib/utils/cn";

// Designets fem stjerner. De øverste står med faste afstande i sektionens top-luft:
// i procent rykkede de ned i overskriften, når sektionen blev høj på mobil. De to
// midt i sektionen vises først fra md, hvor teksten ikke når helt ud til kanterne.
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
 * planio_roadmap "default": "Det her er kun begyndelsen". Overskrift og et
 * åbent antal trin på en stiplet linje under en lille stjernehimmel.
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
      // Stjernehimlen placeres i forhold til sektionen og klippes ved dens kant.
      className="relative overflow-hidden"
      data-slot="planio-roadmap-section"
    >
      <PlanioSky stars={STARS} />
      <PlanioHeader
        title={p.heading}
        description={p.body}
        linkResolver={linkResolver}
        isHero={isHero}
      />
      {steps.length > 0 && (
        <PlanioRoadmap>
          {steps.map((step, i) => (
            <PlanioRoadmap.Step key={i}>
              <PlanioRoadmap.Marker current={step.current} />
              {isFilled.richText(step.tag) ? (
                <EviTag
                  text={step.tag}
                  // Udeladt flade = EviTags lyse primær-flade, så det, appen kan i dag,
                  // står frem mod de neutrale "Senere".
                  surface={step.current ? undefined : "Neutral"}
                  linkResolver={linkResolver}
                  className="self-start lg:mt-3"
                />
              ) : (
                <div />
              )}
              {isFilled.richText(step.title) ? (
                <EviTitle
                  field={step.title}
                  linkResolver={linkResolver}
                  size="lg"
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
            </PlanioRoadmap.Step>
          ))}
        </PlanioRoadmap>
      )}
    </EviSection>
  );
}
