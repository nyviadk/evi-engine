import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { FooterLinkList } from "@/src/components/footer/parts/FooterLinkList";
import type { EviFooterSliceContext } from "@/src/components/footer/types";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviRichText } from "@/src/components/typography/EviRichText";

/**
 * A single footer column that renders a heading + a vertical list of links.
 *
 * Fields:
 *  - heading — Rich Text locked to a single heading3 block (renders via
 *              EviRichText so it inherits evi-prose typography tokens; no
 *              hardcoded <h3> in JSX)
 *  - links   — repeatable Prismic Link with text + target_blank
 *
 * Rendered inside the FooterClassic auto-grid — parent controls column width
 * and wrap behavior. Slice only owns its own vertical rhythm.
 */
export default function FooterColumnLinks({
  slice,
  context,
}: SliceComponentProps<
  Content.FooterColumnLinksSlice,
  EviFooterSliceContext
>): React.ReactElement {
  const { primary } = slice;
  const { linkResolver } = context;

  return (
    <EviStack gap="md" data-slot="footer-column" data-variant="links">
      <EviRichText field={primary.heading} linkResolver={linkResolver} />
      <FooterLinkList items={primary.links} linkResolver={linkResolver} />
    </EviStack>
  );
}
