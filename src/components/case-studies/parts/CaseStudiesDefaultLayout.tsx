import {
  isFilled,
  type Content,
  type LinkResolverFunction,
  type TableField,
} from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import type { RichTextComponents } from "@prismicio/react";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviBox, evi_card_bleed_class } from "@/src/components/ui/EviBox";
import { EviButton } from "@/src/components/ui/EviButton";
import { EviImage } from "@/src/components/ui/EviImage";
import { EviReveal } from "@/src/components/ui/EviReveal";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviRichText } from "@/src/components/typography/EviRichText";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { is_link_filled } from "@/src/lib/prismic/links";
import { cn } from "@/src/lib/utils/cn";

export type CaseStudiesDefaultLayoutProps = {
  slice: Content.CaseStudiesSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

type CaseItem = Content.CaseStudiesSliceDefaultPrimaryCasesItem;

// Cases synlige før "læs alle"-knappen (både mobil + desktop). Resten foldes ud.
const CASE_VISIBLE = 2;

// Meta-celler renderes gennem EviRichText (bevarer fed/kursiv/links), men uden
// paragraph-wrapper → ren inline-tekst i <dt>/<dd> i stedet for et nested <p>.
const INLINE_META: RichTextComponents = {
  paragraph: ({ children }) => <>{children}</>,
};

/**
 * Meta-tabel → semantisk definition-liste (label · værdi). Vi læser feltets rå
 * celler (`body.rows[].cells[].content`) og render'er kun de udfyldte rækker —
 * frem for `<PrismicTable>` der ville give et `<table>`/`<th>` vi skulle style om.
 * Kun de to første celler pr. række bruges (label | værdi) → robust uanset hvad
 * editoren bygger. Tom tabel → intet.
 */
function CaseMeta({
  table,
  linkResolver,
}: {
  table: TableField;
  linkResolver: LinkResolverFunction;
}): React.ReactElement | null {
  const rows = (table?.body?.rows ?? []).filter(
    (row) =>
      isFilled.richText(row.cells[0]?.content) ||
      isFilled.richText(row.cells[1]?.content),
  );
  if (rows.length === 0) return null;

  return (
    <dl className="text-base">
      {rows.map((row) => (
        // Stakket (label over værdi) på smalle kort → værdien får fuld bredde og
        // lange ord klippes ikke; side om side når kortet er 2-kol (samme
        // @3xl/section-breakpoint som split'et). EviStack.rowFrom styrer retningen.
        <EviStack
          key={row.key}
          rowFrom="@3xl/section"
          align="center"
          justify="between"
          gap="xs"
          className="border-t border-current/10 py-3 first:border-t-0"
        >
          <dt className="text-current/60">
            <EviRichText.Raw
              field={row.cells[0]?.content}
              linkResolver={linkResolver}
              extraComponents={INLINE_META}
            />
          </dt>
          <dd className="min-w-0 font-medium wrap-anywhere @3xl/section:text-right">
            <EviRichText.Raw
              field={row.cells[1]?.content}
              linkResolver={linkResolver}
              extraComponents={INLINE_META}
            />
          </dd>
        </EviStack>
      ))}
    </dl>
  );
}

/**
 * Ét case-kort: billede + indhold side om side på desktop, stakket på mobil via
 * en container-query-grid på sektionens bredde. (EviSplit kan IKKE bruges her —
 * den subgrider på sektionens 12-kol-grid, og inde i en EviBox er der intet grid
 * at arve.) DOM = [billede, indhold] = visuel rækkefølge → ingen reorder, a11y-
 * ren (billed-blokken har ingen fokuserbare børn). "Læs mere" vises kun når
 * linket er udfyldt.
 */
function CaseCard({
  item,
  linkResolver,
  collapsed,
}: {
  item: CaseItem;
  linkResolver: LinkResolverFunction;
  collapsed?: boolean;
}): React.ReactElement {
  const has_cta = is_link_filled(item.cta_link);

  return (
    <EviBox
      surface="Neutral"
      data-reveal-overflow={collapsed || undefined}
      className={cn(
        "overflow-hidden",
        collapsed && "hidden group-data-open/reveal:block",
      )}
    >
      <div className="grid items-start gap-6 @3xl/section:grid-cols-2 @3xl/section:gap-8">
        {/* Mobil (1-kol): billedet bløder ud til kort-toppen; desktop (2-kol):
            nulstilles til et normalt, afrundet billede i venstre kolonne. */}
        <EviImage
          field={item.image}
          aspectRatio="landscape"
          variant="plain"
          rounded={false}
          imageClassName="object-cover"
          sizes="(min-width: 768px) 45vw, 92vw"
          className={cn(
            evi_card_bleed_class("top"),
            "@3xl/section:m-0 @3xl/section:w-full @3xl/section:rounded-evi",
          )}
        />
        <EviStack gap="lg">
          <EviHeadingGroup
            title={item.title}
            description={item.description}
            linkResolver={linkResolver}
          />
          <CaseMeta table={item.meta} linkResolver={linkResolver} />
          {has_cta ? (
            <EviButton
              asChild
              variant="primary"
              appearance="text"
              size="md"
              arrow
              className="self-start"
            >
              <PrismicNextLink field={item.cta_link} linkResolver={linkResolver}>
                {isFilled.keyText(item.cta_link.text)
                  ? item.cta_link.text
                  : "Læs mere"}
              </PrismicNextLink>
            </EviButton>
          ) : null}
        </EviStack>
      </div>
    </EviBox>
  );
}

/**
 * CaseStudies "default": intro (overskrift + brødtekst) + en repeatable liste af
 * case-kort. Domain-part (Tailwind tilladt, R3.3); rendres af dispatcheren.
 */
export function CaseStudiesDefaultLayout({
  slice,
  index,
  context,
}: CaseStudiesDefaultLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  const cases = (p.cases ?? []).filter(
    (item) => has_rich_text(item.title, item.description) || isFilled.image(item.image),
  );
  if (!has_rich_text(p.heading, p.body) && cases.length === 0) return null;

  const moreLabel = isFilled.keyText(p.more_label) ? p.more_label : "";
  const collapsible = cases.length > CASE_VISIBLE && moreLabel !== "";

  const list = (
    <EviStack gap="xl">
      {cases.map((item, i) => {
        const key = `case-${i}`;
        return (
          <CaseCard
            key={key}
            item={item}
            linkResolver={linkResolver}
            collapsed={collapsible && i >= CASE_VISIBLE}
          />
        );
      })}
    </EviStack>
  );

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="case-studies"
    >
      {has_rich_text(p.heading, p.body) ? (
        <EviRow>
          <EviHeadingGroup
            title={p.heading}
            description={p.body}
            linkResolver={linkResolver}
            isHero={isHero}
          />
        </EviRow>
      ) : null}

      {collapsible ? (
        // mt-8 matcher kort-gap'et (EviStack gap="xl") → knappen hugger ikke
        // sidste kort som Testimonials' standard mt-2-hug ville.
        <EviReveal label={moreLabel} moreClassName="mt-8">
          {list}
        </EviReveal>
      ) : (
        <EviRow>{list}</EviRow>
      )}
    </EviSection>
  );
}
