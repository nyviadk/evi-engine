import {
  isFilled,
  type Content,
  type LinkField,
  type LinkResolverFunction,
} from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { is_link_filled } from "@/src/lib/prismic/links";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { evi_card_body_class } from "@/src/lib/utils/card-text";
import { EviTitle } from "@/src/components/typography/EviTitle";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviAutoGrid } from "@/src/components/layout/EviAutoGrid";
import {
  EviBox,
  evi_box_class,
  evi_card_bleed_class,
} from "@/src/components/ui/EviBox";
import { EviButton } from "@/src/components/ui/EviButton";
import { EviCard } from "@/src/components/ui/EviCard";
import { EviImage } from "@/src/components/ui/EviImage";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviSectionHeader } from "@/src/components/typography/EviSectionHeader";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { resolve_heading_align } from "@/src/lib/prismic/align";
import { cn } from "@/src/lib/utils/cn";

export type FeaturesBentoLayoutProps = {
  slice: Content.FeaturesSliceBento;
  index: number;
  context: EviPageSliceContext;
};

// Delt tekst-skala for tekst-kortene (2–4). Kasse 1 er større (feature).
const CARD_BODY = evi_card_body_class();

// Uniform gap på alle celle-mellemrum → ét sammenhængende gitter; overrider
// EviSplit/AutoGrid/Stack's egne gaps.
const BENTO_GAP = "gap-4 md:gap-6";

function CardLink({
  field,
  linkResolver,
  className,
}: {
  field: LinkField;
  linkResolver: LinkResolverFunction;
  className?: string;
}): React.ReactElement | null {
  if (!is_link_filled(field)) return null;
  return (
    <EviButton
      asChild
      appearance="text"
      arrow
      className={cn("w-fit", className)}
    >
      <PrismicNextLink field={field} linkResolver={linkResolver} />
    </EviButton>
  );
}

// Tekst-kort-indhold (titel + tekst + link) til kasse 2 — sidder ved siden af
// et billede, så det er en simpel EviStack (ingen søskende at række-aligne med).
function CardContent({
  title,
  body,
  link,
  linkResolver,
}: {
  title: Content.FeaturesSliceBentoPrimary["card_2_title"];
  body: Content.FeaturesSliceBentoPrimary["card_2_body"];
  link: LinkField;
  linkResolver: LinkResolverFunction;
}): React.ReactElement {
  return (
    <EviStack gap="sm">
      <EviTitle field={title} linkResolver={linkResolver} size="lg" />
      <EviRichText field={body} linkResolver={linkResolver} className={CARD_BODY} />
      <CardLink field={link} linkResolver={linkResolver} />
    </EviStack>
  );
}

// Kasse 3 + 4: EviCard (grid-rows-subgrid) så titel/tekst/link-rækkerne aligner
// på tværs af de to søster-kort. Faste 3 slots — tomme wrappes i <div /> så
// subgrid-optællingen holder (jf. FeaturesCardsLayout).
function BentoTextCard({
  title,
  body,
  link,
  linkResolver,
  className,
}: {
  title: Content.FeaturesSliceBentoPrimary["card_3_title"];
  body: Content.FeaturesSliceBentoPrimary["card_3_body"];
  link: LinkField;
  linkResolver: LinkResolverFunction;
  className?: string;
}): React.ReactElement {
  return (
    <EviCard rows={3} className={cn(evi_box_class(), className)}>
      {isFilled.richText(title) ? (
        <EviTitle field={title} linkResolver={linkResolver} size="lg" />
      ) : (
        <div />
      )}
      {isFilled.richText(body) ? (
        <EviRichText
          field={body}
          linkResolver={linkResolver}
          className={cn("mt-2", CARD_BODY)}
        />
      ) : (
        <div />
      )}
      {is_link_filled(link) ? (
        <CardLink field={link} linkResolver={linkResolver} className="mt-4" />
      ) : (
        <div />
      )}
    </EviCard>
  );
}

/**
 * Features-variation "bento": centreret overskrift, derefter et bento-gitter
 * komponeret af vores layout-primitiver — EviSplit (høj kasse 1 til venstre +
 * to-rækkers højre-kolonne), EviStack (den vertikale højre-kolonne) og
 * EviAutoGrid (kasse 2's tekst|billede samt kasse 3/4-rækken). Kasse 1 =
 * baggrundsbillede + gradient-overlay + lys tekst. Farve-ROLLERNE er faste pr.
 * position (neutral tint / primær solid / sekundær blød), men farverne kommer
 * fra tenantens brand via theme-klasserne. Domain-part (Tailwind tilladt, R3.3).
 *
 * a11y: DOM følger læse-rækkefølgen (overskrift → kasse 1 → 2 → 3 → 4); EviSplit
 * stretcher kun visuelt. I kasse 2 leder teksten (billedet er dekorativt).
 */
export function FeaturesBentoLayout({
  slice,
  index,
  context,
}: FeaturesBentoLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  // Guard pr. kasse: tom kasse rendres ikke (ellers tom overlay-boks). Billede
  // tæller kun for kasse 1 + 2 (de eneste med billed-felt).
  const card1Has =
    isFilled.image(p.card_1_image) ||
    has_rich_text(p.card_1_title, p.card_1_body) ||
    is_link_filled(p.card_1_link);
  const card2Has =
    isFilled.image(p.card_2_image) ||
    has_rich_text(p.card_2_title, p.card_2_body) ||
    is_link_filled(p.card_2_link);
  const card3Has =
    has_rich_text(p.card_3_title, p.card_3_body) || is_link_filled(p.card_3_link);
  const card4Has =
    has_rich_text(p.card_4_title, p.card_4_body) || is_link_filled(p.card_4_link);

  // Udfyldt CTA → header venstre-stilles med knappen yderst til højre.
  const hasCta = is_link_filled(p.cta_link);

  const hasAnyContent =
    has_rich_text(p.heading, p.body) ||
    hasCta ||
    card1Has ||
    card2Has ||
    card3Has ||
    card4Has;
  if (!hasAnyContent) return null;

  // Kasse 1 — høj billed-kasse med gradient-overlay + lys tekst. Overlay/absolut
  // billede er iboende for "tekst-på-billede" (ingen primitiv dækker det); selve
  // tekst-kolonnen er en EviStack skubbet til bunden.
  const card1 = card1Has ? (
    // direction="row" så tekst-kolonnen (eneste in-flow-barn) stretches til fuld
    // korthøjde og dens justify-end kan skubbe teksten til bunden. Billede+overlay
    // er absolut (ude af flow) → gap er uden effekt.
    <EviStack
      direction="row"
      className="shadow-evi relative isolate min-h-104 overflow-hidden rounded-evi"
    >
      <EviImage
        field={p.card_1_image}
        variant="plain"
        className="absolute inset-0 -z-20 size-full rounded-none"
        imageClassName="object-cover"
        sizes="(min-width: 768px) 40vw, 100vw"
      />
      {/* Lys brand-overlay (ikke mørk: mindre dominerende), stærkest i bunden
          hvor teksten står → kontrast til mørk on-light-tekst. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-evi-light/90 via-evi-light/55 to-evi-light/5"
      />
      <EviStack
        justify="end"
        gap="sm"
        className="w-full p-4 text-evi-text-on-light sm:p-6 md:p-8"
      >
        <EviRichText
          field={p.card_1_title}
          linkResolver={linkResolver}
          className="[&_h3]:m-0 [&_h3]:text-2xl [&_h3]:leading-tight [&_h3]:font-semibold"
        />
        <EviRichText
          field={p.card_1_body}
          linkResolver={linkResolver}
          className="[&_p]:m-0"
        />
        {is_link_filled(p.card_1_link) && (
          <EviButton asChild appearance="solid" className="mt-2 w-fit self-start">
            <PrismicNextLink field={p.card_1_link} linkResolver={linkResolver} />
          </EviButton>
        )}
      </EviStack>
    </EviStack>
  ) : null;

  // Højre kolonne: kasse 2 over en AutoGrid-række (kasse 3 + 4). Kasse 3/4-rækken
  // droppes helt hvis begge er tomme.
  const rightColumn = (
    <EviStack className={BENTO_GAP}>
      {card2Has && (
        <EviBox className="overflow-hidden">
          <EviAutoGrid size="duo" className="items-end">
            <CardContent
              title={p.card_2_title}
              body={p.card_2_body}
              link={p.card_2_link}
              linkResolver={linkResolver}
            />
            {isFilled.image(p.card_2_image) && (
              // Billedet bløder ud til kort-kanterne (siderne + bunden) på mobil;
              // ved 2 kolonner (container ≥532px) nulstilles alt → indrammet igen.
              <EviImage
                field={p.card_2_image}
                variant="plain"
                aspectRatio="square"
                rounded={false}
                imageClassName="object-cover"
                sizes="(min-width: 768px) 30vw, 100vw"
                className={cn(
                  evi_card_bleed_class("bottom"),
                  "@[532px]/grid:m-0 @[532px]/grid:w-full @[532px]/grid:rounded-evi",
                )}
              />
            )}
          </EviAutoGrid>
        </EviBox>
      )}

      {(card3Has || card4Has) && (
        <EviAutoGrid size="duo" className={BENTO_GAP}>
          {/* Kort 4 = primær pop (bookender kort 1's primær-knap). Kort 3 =
              sekundær TINT, ikke -soft: 10%-soft ligger for tæt på det neutrale
              kort 2 ovenover → de ville se ens ud. */}
          {card3Has && (
            <BentoTextCard
              title={p.card_3_title}
              body={p.card_3_body}
              link={p.card_3_link}
              linkResolver={linkResolver}
              className="theme-surface-secondary"
            />
          )}
          {card4Has && (
            <BentoTextCard
              title={p.card_4_title}
              body={p.card_4_body}
              link={p.card_4_link}
              linkResolver={linkResolver}
              className="theme-primary"
            />
          )}
        </EviAutoGrid>
      )}
    </EviStack>
  );

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="features-bento"
    >
      <EviSectionHeader
        title={p.heading}
        description={p.body}
        ctaLink={p.cta_link}
        linkResolver={linkResolver}
        isHero={isHero}
        align={resolve_heading_align(p.heading_align)}
      />
      <EviSplit preset="40-60" align="stretch" className={BENTO_GAP}>
        {card1}
        {rightColumn}
      </EviSplit>
    </EviSection>
  );
}
