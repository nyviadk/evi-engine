import { asText, isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviMasonry } from "@/src/components/layout/EviMasonry";
import { EviSectionHeader } from "@/src/components/typography/EviSectionHeader";
import { EviBox } from "@/src/components/ui/EviBox";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviReveal } from "@/src/components/ui/EviReveal";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { evi_card_title_class } from "@/src/lib/utils/card-text";
import { cn } from "@/src/lib/utils/cn";

export type TestimonialsLayoutProps = {
  slice: Content.TestimonialsSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

// Kort synlige på mobil før "vis flere". Desktop viser altid alle.
const MOBILE_VISIBLE = 4;

/**
 * Testimonials: centreret intro + masonry-væg af anmeldelses-kort. Hvert kort
 * har egen farve (per-kasse `box_color`), egen højde (indhold), og stables i
 * kolonne-flow. På mobil kollapser væggen til de første fire med en "vis flere"-
 * knap. Domain-part (Tailwind tilladt, R3.3).
 */
export function TestimonialsLayout({
  slice,
  index,
  context,
}: TestimonialsLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  // Kun anmeldelser med indhold — tomme group-rækker rendres ikke.
  const items = (p.testimonials ?? []).filter((t) =>
    has_rich_text(t.title, t.body),
  );
  if (!has_rich_text(p.heading, p.body) && items.length === 0) {
    return null;
  }

  const count = items.length;

  // Balancér spalter mod antal: 2 og 4 kort ser bedst ud i 2 spalter (2×2), ikke
  // 3 med en enlig rest-kolonne. 3 og 5+ bruger op til 3 (bredden capper videre).
  const maxColumns: 1 | 2 | 3 =
    count <= 1 ? 1 : count === 2 || count === 4 ? 2 : 3;

  const moreLabel = isFilled.keyText(p.more_label) ? p.more_label : "";
  const collapsible = count > MOBILE_VISIBLE && moreLabel !== "";

  const boxes = items.map((t, i) => {
    const overflow = collapsible && i >= MOBILE_VISIBLE;
    return (
      <EviBox
        key={asText(t.title) || asText(t.body)}
        surface={t.box_color}
        data-reveal-overflow={overflow || undefined}
        className={cn(
          overflow && "max-md:hidden group-data-open/reveal:max-md:block",
        )}
      >
        <div className={cn("evi-prose", evi_card_title_class("lg"))}>
          <EviRichText.Raw field={t.title} linkResolver={linkResolver} />
        </div>
        <div className="evi-prose mt-3 [&_p]:m-0">
          <EviRichText.Raw field={t.body} linkResolver={linkResolver} />
        </div>
        {isFilled.richText(t.attribution) ? (
          <div className="evi-prose mt-4 [&_p]:m-0 [&_p]:text-sm [&_p]:opacity-70">
            <EviRichText.Raw field={t.attribution} linkResolver={linkResolver} />
          </div>
        ) : null}
      </EviBox>
    );
  });

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="testimonials"
    >
      <EviSectionHeader
        title={p.heading}
        description={p.body}
        linkResolver={linkResolver}
        isHero={isHero}
      />
      {collapsible ? (
        <EviReveal label={moreLabel} moreClassName="md:hidden">
          <EviMasonry maxColumns={maxColumns}>{boxes}</EviMasonry>
        </EviReveal>
      ) : (
        <EviMasonry maxColumns={maxColumns}>{boxes}</EviMasonry>
      )}
    </EviSection>
  );
}
