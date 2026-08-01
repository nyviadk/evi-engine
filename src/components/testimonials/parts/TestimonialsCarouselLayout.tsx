import { asText, isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviSectionHeader } from "@/src/components/typography/EviSectionHeader";
import { EviCarousel } from "@/src/components/ui/EviCarousel";
import { EviIcon } from "@/src/components/ui/EviIcon";
import { EviRichText } from "@/src/components/typography/EviRichText";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { resolve_heading_align } from "@/src/lib/prismic/align";
import { has_rich_text } from "@/src/lib/prismic/fields";

export type TestimonialsCarouselLayoutProps = {
  slice: Content.TestimonialsSliceCarousel;
  index: number;
  context: EviPageSliceContext;
};

/**
 * Testimonials "carousel": ét citat ad gangen med pile/dots/pil-taster.
 *
 * Server/client-snit (så mindst muligt er client): ALT tungt render'es her på
 * serveren — intro (heading+body), det centrerede citat-ikon (uden for client'en),
 * hvert slides tekst, og pil-ikonet (EviIcon er server-async). Kun index-state +
 * knap-clicks + tastatur lever i client-EviCarousel, der bare får server-nodes ind.
 * Domain-part (Tailwind tilladt, R3.3).
 */
export function TestimonialsCarouselLayout({
  slice,
  index,
  context,
}: TestimonialsCarouselLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  const items = (p.testimonials ?? []).filter((t) => isFilled.richText(t.body));
  if (!has_rich_text(p.heading, p.body) && items.length === 0) return null;

  const arrowName = isFilled.keyText(p.arrow_icon)
    ? p.arrow_icon
    : "chevron-right";

  const slides = items.map((t, i) => (
    <EviStack
      key={i}
      align="center"
      gap="md"
      className="mx-auto max-w-3xl text-center"
    >
      <EviRichText
        field={t.body}
        linkResolver={linkResolver}
        className="evi-lead [&_p]:m-0"
      />
      {(isFilled.richText(t.attribution) || isFilled.richText(t.title)) && (
        <EviStack
          direction="row"
          wrap
          align="center"
          justify="center"
          gap="sm"
          className="text-sm"
        >
          {isFilled.richText(t.attribution) && (
            <EviRichText
              field={t.attribution}
              linkResolver={linkResolver}
              className="[&_p]:m-0 [&_p]:font-medium"
            />
          )}
          {isFilled.richText(t.attribution) && isFilled.richText(t.title) && (
            <span
              aria-hidden
              className="size-1 shrink-0 rounded-full bg-current"
            />
          )}
          {isFilled.richText(t.title) && (
            <EviRichText
              field={t.title}
              linkResolver={linkResolver}
              className="[&_p]:m-0"
            />
          )}
        </EviStack>
      )}
    </EviStack>
  ));

  const dotLabels = items.map((t) => asText(t.attribution));

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="testimonials-carousel"
    >
      <EviSectionHeader
        title={p.heading}
        description={p.body}
        linkResolver={linkResolver}
        isHero={isHero}
        align={resolve_heading_align(p.heading_align)}
      />

      <EviStack align="center" gap="xl" className="col-span-12">
        {isFilled.keyText(p.quote_icon) && (
          <EviIcon name={p.quote_icon} className="size-8 text-current/40" />
        )}
        <EviCarousel
          slides={slides}
          icon={<EviIcon name={arrowName} className="size-5" />}
          label={asText(p.heading) || undefined}
          prevLabel={p.prev_label ?? ""}
          nextLabel={p.next_label ?? ""}
          dotLabels={dotLabels}
          className="w-full"
        />
      </EviStack>
    </EviSection>
  );
}
