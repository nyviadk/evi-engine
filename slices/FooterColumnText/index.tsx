import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import type { EviFooterSliceContext } from "@/src/components/footer/types";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviStack } from "@/src/components/layout/EviStack";

/**
 * A single footer column that renders a heading + a rich-text body. Used
 * for company info (address, CVR, opening hours) — content that isn't a
 * navigation link list.
 *
 * Fields:
 *  - heading — Rich Text locked to a single heading3 block
 *  - body    — Rich Text (paragraphs, links, emphasis)
 *
 * Both fields render via EviRichText so text inherits evi-prose typography
 * tokens — no hardcoded tags in JSX.
 */
export default function FooterColumnText({
  slice,
  context,
}: SliceComponentProps<
  Content.FooterColumnTextSlice,
  EviFooterSliceContext
>): React.ReactElement {
  const { primary } = slice;
  const { linkResolver } = context;

  return (
    <EviStack gap="md" data-slot="footer-column" data-variant="text">
      <EviRichText field={primary.heading} linkResolver={linkResolver} />
      <EviRichText field={primary.body} linkResolver={linkResolver} />
    </EviStack>
  );
}
