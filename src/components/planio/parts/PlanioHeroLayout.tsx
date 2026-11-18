import { isFilled, type Content } from "@prismicio/client";

import { EviStack } from "@/src/components/layout/EviStack";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviPhoneMockup } from "@/src/components/ui/EviPhoneMockup";
import { EviStoreButtons } from "@/src/components/ui/EviStoreButton";
import { PlanioDayScreen } from "@/src/components/planio/PlanioDayScreen";
import { PlanioHeroSection } from "@/src/components/planio/PlanioHeroSection";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { has_link } from "@/src/lib/prismic/links";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

export type PlanioHeroLayoutProps = {
  slice: Content.PlanioHeroSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

/**
 * planio_hero "default": overskrift, knapper og note over en telefon med dagens
 * plan, der rejser sig af horisont-buen. Domain-part (Tailwind tilladt, R3.3).
 *
 * Slicen har bevidst intet background_theme: den ender i den lyse bue, og
 * compute_slice_contexts læser et manglende tema som lyst, så en lys sektion
 * nedenunder lægger sig direkte op ad buen (kollapset top-padding).
 */
export function PlanioHeroLayout({
  slice,
  index,
  context,
}: PlanioHeroLayoutProps): React.ReactElement | null {
  const { linkResolver, lang } = context;
  const { isHero } = resolve_slice_context(context, index);
  const p = slice.primary;

  if (
    !has_rich_text(p.heading, p.body) &&
    !has_link(p.cta_link, p.cta_link_secondary)
  ) {
    return null;
  }

  const items = p.plan_items ?? [];
  const has_plan = isFilled.richText(p.plan_day) || items.length > 0;

  return (
    <PlanioHeroSection
      data-slot="planio-hero"
      horizonLabel={isFilled.keyText(p.plan_label) ? p.plan_label : undefined}
      horizon={
        has_plan ? (
          <EviPhoneMockup>
            <PlanioDayScreen
              initials={p.plan_initials}
              day={p.plan_day}
              date={p.plan_date}
              energy={p.plan_energy}
              energyLeft={p.plan_energy_left}
              energyUsed={p.plan_energy_used}
              items={items}
              linkResolver={linkResolver}
            />
          </EviPhoneMockup>
        ) : undefined
      }
    >
      <EviStack gap="lg" align="center">
        <EviHeadingGroup
          title={p.heading}
          description={p.body}
          linkResolver={linkResolver}
          isHero={isHero}
          align="center"
        />
        <EviStoreButtons
          primary={p.cta_link}
          secondary={p.cta_link_secondary}
          linkResolver={linkResolver}
          lang={lang}
        />
        {isFilled.richText(p.note) && (
          <EviRichText
            field={p.note}
            linkResolver={linkResolver}
            className="text-center text-sm font-semibold"
          />
        )}
      </EviStack>
    </PlanioHeroSection>
  );
}
