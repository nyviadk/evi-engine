import { type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { PlanioHeader } from "@/src/components/planio/PlanioHeader";
import { PlanioRoadmap } from "@/src/components/planio/PlanioRoadmap";
import { PlanioSky, type PlanioSkyStar } from "@/src/components/planio/PlanioSky";
import { has_rich_text } from "@/src/lib/prismic/fields";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

// Designets fem stjerner langs kanterne, fri af tekst og trin. Den nederste til
// venstre vises først fra md: på mobil løber tidslinjen langs venstre kant.
const STARS: PlanioSkyStar[] = [
  { position: "left-[4%] top-[7%]" },
  { position: "left-[46%] top-[5%]", big: true },
  { position: "left-[91%] top-[10%]" },
  { position: "left-[96%] top-[48%]" },
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
              <PlanioRoadmap.Tag
                field={step.tag}
                linkResolver={linkResolver}
                current={step.current}
              />
              <PlanioRoadmap.Text
                title={step.title}
                body={step.body}
                linkResolver={linkResolver}
              />
            </PlanioRoadmap.Step>
          ))}
        </PlanioRoadmap>
      )}
    </EviSection>
  );
}
