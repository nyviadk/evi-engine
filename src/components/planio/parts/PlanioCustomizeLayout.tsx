import {
  isFilled,
  type Content,
  type LinkResolverFunction,
  type RichTextField,
} from "@prismicio/client";

import { EviRow } from "@/src/components/layout/EviRow";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviTitle } from "@/src/components/typography/EviTitle";
import { EviBox } from "@/src/components/ui/EviBox";
import { EviCard } from "@/src/components/ui/EviCard";
import { evi_card_body_class } from "@/src/lib/utils/card-text";
import { cn } from "@/src/lib/utils/cn";
import { PlanioColors } from "@/src/components/planio/PlanioColors";
import {
  PlanioCustomizeColors,
  presets_of,
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

// Fed tekst i overskriften ("My") får farven fra demoen. Samme tone og mætning,
// men lysheden holdes over/under en grænse, så den kan læses på baggrunden.
// Uden relativ farve-syntaks ignoreres reglen, og ordet arver overskriftens farve.
const CHOSEN_ON_DARK = "[&>:is(h1,h2)_strong]:text-[oklch(from_var(--planio-chosen)_max(l,0.65)_c_h)]";
const CHOSEN_ON_LIGHT = "[&>:is(h1,h2)_strong]:text-[oklch(from_var(--planio-chosen)_min(l,0.5)_c_h)]";

/**
 * En flise som Evis kort: ramme, titel og tekst i hver sin EviCard-række, så
 * titler og tekster flugter på tværs af de to fliser.
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
    <EviCard rows={3}>
      {frame}
      <EviTitle field={title} linkResolver={linkResolver} size="lg" className="mt-4" />
      <EviRichText
        field={body}
        linkResolver={linkResolver}
        className={cn("mt-2", evi_card_body_class())}
      />
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

  const start = start_palette(p);
  const has_colors = start !== null;
  const has_energy = has_energy_units(p);
  const has_days = has_day_settings(p);
  if (!has_rich_text(p.heading, p.body) && !has_colors && !has_energy && !has_days) {
    return null;
  }

  const content = (
    <>
      <EviHeadingGroup
        title={p.heading}
        description={p.body}
        linkResolver={linkResolver}
        isHero={isHero}
        className={theme === "dark" ? CHOSEN_ON_DARK : CHOSEN_ON_LIGHT}
      />
      {(has_colors || has_energy) && (
        <EviSplit preset="60-40" rows={3}>
          <Tile
            frame={
              <EviBox surface="Neutral" size="compact">
                <PlanioCustomizeColors p={p} linkResolver={linkResolver} />
              </EviBox>
            }
            title={p.colors_title}
            body={p.colors_body}
            linkResolver={linkResolver}
          />
          <Tile
            frame={
              <EviBox surface="Neutral" size="compact" aria-hidden>
                <PlanioEnergyUnits p={p} linkResolver={linkResolver} />
              </EviBox>
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
            <EviBox surface="Neutral" size="compact" aria-hidden>
              <PlanioDaySettings p={p} linkResolver={linkResolver} />
            </EviBox>
            {isFilled.keyText(p.days_label) && (
              <figcaption className="sr-only">{p.days_label}</figcaption>
            )}
          </figure>
        </EviRow>
      )}
    </>
  );

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="planio-customize"
    >
      {start ? (
        <PlanioColors start={start} presets={presets_of(p)}>
          {content}
        </PlanioColors>
      ) : (
        content
      )}
    </EviSection>
  );
}
