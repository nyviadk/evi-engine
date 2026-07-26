import { isFilled, type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviAutoGrid } from "@/src/components/layout/EviAutoGrid";
import { EviCard } from "@/src/components/ui/EviCard";
import { EviDivider } from "@/src/components/ui/EviDivider";
import { EviCheckList } from "@/src/components/ui/EviCheckList";
import { EviButton } from "@/src/components/ui/EviButton";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { evi_box_class } from "@/src/components/ui/EviBox";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { resolve_heading_align } from "@/src/lib/prismic/align";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { is_link_filled } from "@/src/lib/prismic/links";
import { resolve_surface } from "@/src/lib/utils/surface";
import { evi_card_title_class } from "@/src/lib/utils/card-text";
import { cn } from "@/src/lib/utils/cn";

export type PricesDefaultLayoutProps = {
  slice: Content.PricesSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

/**
 * Prices "default": intro + et grid af pris-kort. Hvert kort er et 7-rækkers
 * EviCard-subgrid, så titel/pris/undertekst/divider/beskrivelse/checkliste/CTA
 * flugter PÅ TVÆRS af kortene uanset indholdslængde. Valgfrie felter wrappes i
 * `<div />` så subgrid-rækkerne holder. Domain-part (Tailwind tilladt, R3.3).
 */
export function PricesDefaultLayout({
  slice,
  index,
  context,
}: PricesDefaultLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  const plans = (p.plans ?? []).filter(
    (plan) => has_rich_text(plan.title, plan.price) || isFilled.richText(plan.included),
  );
  if (!has_rich_text(p.heading, p.body) && plans.length === 0) return null;

  const cardColor = p.card_color;
  // Pris-kort ser bedst ud i 2–3 (4 → quad så der ikke bliver en enlig rest).
  const size = plans.length === 2 ? "duo" : plans.length === 4 ? "quad" : "trio";

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="prices"
    >
      {has_rich_text(p.heading, p.body) ? (
        <EviHeadingGroup
          title={p.heading}
          description={p.body}
          linkResolver={linkResolver}
          isHero={isHero}
          align={resolve_heading_align(p.heading_align)}
        />
      ) : null}

      <EviAutoGrid size={size}>
        {plans.map((plan, i) => {
          const has_cta = is_link_filled(plan.cta_link);
          return (
            <EviCard
              key={i}
              rows={7}
              className={cn(resolve_surface(cardColor), evi_box_class())}
            >
              {/* 1 · titel */}
              <EviRichText
                field={plan.title}
                linkResolver={linkResolver}
                className={evi_card_title_class("lg")}
              />
              {/* 2 · pris (stort) */}
              <EviRichText
                field={plan.price}
                linkResolver={linkResolver}
                className="mt-2 [&_p]:m-0 [&_p]:text-3xl [&_p]:font-bold"
              />
              {/* 3 · undertekst */}
              {isFilled.richText(plan.caption) ? (
                <EviRichText
                  field={plan.caption}
                  linkResolver={linkResolver}
                  className="mt-1 [&_p]:m-0 [&_p]:text-sm [&_p]:opacity-70"
                />
              ) : (
                <div />
              )}
              {/* 4 · divider */}
              <EviDivider className="my-5" />
              {/* 5 · beskrivelse (multi → afsnit/lister beholder prose-afstand) */}
              {isFilled.richText(plan.body) ? (
                <EviRichText
                  field={plan.body}
                  linkResolver={linkResolver}
                  className="text-sm"
                />
              ) : (
                <div />
              )}
              {/* 6 · inkluderet-checkliste */}
              {isFilled.richText(plan.included) ? (
                <EviCheckList
                  field={plan.included}
                  icon={plan.included_icon}
                  linkResolver={linkResolver}
                  className="mt-8 text-sm"
                />
              ) : (
                <div />
              )}
              {/* 7 · CTA (valgfri) — flugter i bunden via subgrid */}
              {has_cta ? (
                <EviButton
                  asChild
                  variant="primary"
                  appearance="solid"
                  size="md"
                  className="mt-6 w-full"
                >
                  <PrismicNextLink
                    field={plan.cta_link}
                    linkResolver={linkResolver}
                  />
                </EviButton>
              ) : (
                <div />
              )}
            </EviCard>
          );
        })}
      </EviAutoGrid>
    </EviSection>
  );
}
