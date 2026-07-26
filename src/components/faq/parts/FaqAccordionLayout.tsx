import { type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { has_rich_text } from "@/src/lib/prismic/fields";
import { is_link_filled } from "@/src/lib/prismic/links";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviAccordion, EviAccordionItem } from "@/src/components/ui/EviAccordion";
import { EviButton } from "@/src/components/ui/EviButton";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

export type FaqAccordionLayoutProps = {
  slice: Content.FaqSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

/**
 * FAQ-variation "default": centreret sektion-header, en enkelt kolonne af native
 * `<details>`-accordions med blød åben/luk-animation, og en valgfri CTA centreret
 * i BUNDEN (fallback efter spørgsmålene, fx "Kontakt os" — hører logisk efter man
 * har skimmet spørgsmålene, modsat bentos browse-CTA i headeren). Domain-part
 * (Tailwind tilladt, R3.3).
 */
export function FaqAccordionLayout({
  slice,
  index,
  context,
}: FaqAccordionLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  // Kun spørgsmål med indhold — tomme group-rækker rendres ikke.
  const items = (p.items ?? []).filter((item) =>
    has_rich_text(item.question, item.answer),
  );

  const has_header = has_rich_text(p.heading, p.body);
  const has_cta = is_link_filled(p.cta_link);
  if (!has_header && !has_cta && items.length === 0) return null;

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="faq"
    >
      <EviHeadingGroup
        title={p.heading}
        description={p.body}
        linkResolver={linkResolver}
        isHero={isHero}
        align="center"
      />
      {items.length > 0 && (
        <EviRow>
          <EviAccordion className="mx-auto w-full max-w-3xl">
            {items.map((item, i) => (
              <EviAccordionItem
                key={i}
                summary={
                  <EviRichText
                    field={item.question}
                    linkResolver={linkResolver}
                    className="[&_h3]:m-0 [&_h3]:text-base [&_h3]:leading-snug [&_h3]:font-semibold md:[&_h3]:text-lg"
                  />
                }
              >
                <EviRichText
                  field={item.answer}
                  linkResolver={linkResolver}
                  className="max-w-prose [&_p]:mt-0"
                />
              </EviAccordionItem>
            ))}
          </EviAccordion>
        </EviRow>
      )}
      {has_cta && (
        <EviRow>
          <EviStack align="center">
            <EviButton asChild variant="primary" appearance="solid">
              <PrismicNextLink field={p.cta_link} linkResolver={linkResolver} />
            </EviButton>
          </EviStack>
        </EviRow>
      )}
    </EviSection>
  );
}
