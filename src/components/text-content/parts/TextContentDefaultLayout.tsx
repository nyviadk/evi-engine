import { isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviBox } from "@/src/components/ui/EviBox";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviSectionHeader } from "@/src/components/typography/EviSectionHeader";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { resolve_heading_align } from "@/src/lib/prismic/align";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { EviTitle } from "@/src/components/typography/EviTitle";

export type TextContentDefaultLayoutProps = {
  slice: Content.TextContentSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

/**
 * TextContent "default": intro (overskrift + tekst) + to tekst-kolonner. Venstre
 * = underoverskrift + tekst + en fremhævet boks (titel + tekst); højre = bare
 * underoverskrift + tekst. Kolonnerne top-flugtes (align="start"), da højre er
 * kortere. Domain-part (Tailwind tilladt, R3.3).
 */
export function TextContentDefaultLayout({
  slice,
  index,
  context,
}: TextContentDefaultLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  const hasBox = has_rich_text(p.box_title, p.box_body);
  const hasLeft = has_rich_text(p.left_heading, p.left_body) || hasBox;
  const hasRight = has_rich_text(p.right_heading, p.right_body);
  if (!has_rich_text(p.heading, p.body) && !hasLeft && !hasRight) return null;

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="text-content"
    >
      <EviSectionHeader
        title={p.heading}
        description={p.body}
        linkResolver={linkResolver}
        isHero={isHero}
        align={resolve_heading_align(p.heading_align)}
      />

      {(hasLeft || hasRight) && (
        <EviSplit preset="50-50" align="start">
          <EviStack gap="md">
            {isFilled.richText(p.left_heading) && (
              <EviTitle
                field={p.left_heading}
                linkResolver={linkResolver}
                size="2xl"
              />
            )}
            {isFilled.richText(p.left_body) && (
              <EviRichText field={p.left_body} linkResolver={linkResolver} />
            )}
            {hasBox && (
              <EviBox surface={p.box_color}>
                <EviStack gap="sm">
                  {isFilled.richText(p.box_title) && (
                    <EviTitle
                      field={p.box_title}
                      linkResolver={linkResolver}
                      size="lg"
                    />
                  )}
                  {isFilled.richText(p.box_body) && (
                    <EviRichText
                      field={p.box_body}
                      linkResolver={linkResolver}
                    />
                  )}
                </EviStack>
              </EviBox>
            )}
          </EviStack>

          <EviStack gap="md">
            {isFilled.richText(p.right_heading) && (
              <EviTitle
                field={p.right_heading}
                linkResolver={linkResolver}
                size="2xl"
              />
            )}
            {isFilled.richText(p.right_body) && (
              <EviRichText field={p.right_body} linkResolver={linkResolver} />
            )}
          </EviStack>
        </EviSplit>
      )}
    </EviSection>
  );
}
