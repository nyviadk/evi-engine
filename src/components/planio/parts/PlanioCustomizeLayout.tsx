import {
  isFilled,
  type Content,
  type LinkResolverFunction,
  type RichTextField,
} from "@prismicio/client";

import { EviRow } from "@/src/components/layout/EviRow";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviTitle } from "@/src/components/typography/EviTitle";
import { EviCard } from "@/src/components/ui/EviCard";
import { PlanioHeader } from "@/src/components/planio/PlanioHeader";
import { PlanioFrame } from "@/src/components/planio/PlanioFrame";
import {
  PlanioCustomizeColors,
  start_palette,
} from "@/src/components/planio/parts/PlanioCustomizeColors";
import {
  PlanioDaySettings,
  PlanioEnergyUnits,
  has_day_settings,
  has_energy_units,
} from "@/src/components/planio/parts/PlanioCustomizeTiles";
import { has_rich_text } from "@/src/lib/prismic/fields";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

export type PlanioCustomizeLayoutProps = {
  slice: Content.PlanioCustomizeSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

/**
 * En flise: ramme + billedtekst som EviCard-rækker, så billedteksterne flugter
 * på tværs af de to fliser i EviSplit, selv om rammerne er forskelligt høje.
 */
function Tile({
  frame,
  title,
  body,
  linkResolver,
}: {
  frame: React.ReactNode;
  title: RichTextField;
  body: RichTextField;
  linkResolver: LinkResolverFunction;
}): React.ReactElement {
  return (
    <EviCard rows={2}>
      {frame}
      <EviStack gap="sm" className="mt-4">
        <EviTitle field={title} linkResolver={linkResolver} size="lg" />
        <EviRichText field={body} linkResolver={linkResolver} className="max-w-prose" />
      </EviStack>
    </EviCard>
  );
}

/**
 * planio_customize "default": "Gør appen til din". To fliser side om side
 * (farvevælger 60 / energi 40) og indstillingerne i fuld bredde under.
 */
export function PlanioCustomizeLayout({
  slice,
  index,
  context,
}: PlanioCustomizeLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(context, index);
  const p = slice.primary;

  const has_colors = start_palette(p) !== null;
  const has_energy = has_energy_units(p);
  const has_days = has_day_settings(p);
  if (!has_rich_text(p.heading, p.body) && !has_colors && !has_energy && !has_days) {
    return null;
  }

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="planio-customize"
    >
      <PlanioHeader
        title={p.heading}
        description={p.body}
        linkResolver={linkResolver}
        isHero={isHero}
      />
      {(has_colors || has_energy) && (
        <EviSplit preset="60-40" rows={2}>
          <Tile
            frame={
              <PlanioFrame tone="neutral">
                <PlanioCustomizeColors p={p} linkResolver={linkResolver} />
              </PlanioFrame>
            }
            title={p.colors_title}
            body={p.colors_body}
            linkResolver={linkResolver}
          />
          <Tile
            frame={
              <PlanioFrame tone="neutral" aria-hidden>
                <PlanioEnergyUnits p={p} linkResolver={linkResolver} />
              </PlanioFrame>
            }
            title={p.energy_title}
            body={p.energy_body}
            linkResolver={linkResolver}
          />
        </EviSplit>
      )}
      {has_days && (
        <EviRow>
          <figure>
            <PlanioFrame tone="neutral" aria-hidden>
              <PlanioDaySettings p={p} linkResolver={linkResolver} />
            </PlanioFrame>
            {isFilled.keyText(p.days_label) && (
              <figcaption className="sr-only">{p.days_label}</figcaption>
            )}
          </figure>
        </EviRow>
      )}
    </EviSection>
  );
}
