import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { FooterLinkList } from "@/src/components/footer/parts/FooterLinkList";
import type { EviFooterSliceContext } from "@/src/components/footer/types";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviTitle } from "@/src/components/typography/EviTitle";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { is_link_filled } from "@/src/lib/prismic/links";

/**
 * A single footer column: a heading + a vertical list of links. Rendered
 * inside the FooterClassic auto-grid — parent controls column width and wrap;
 * slice only owns its own vertical rhythm.
 */
export default function FooterColumnLinks({
  slice,
  context,
}: SliceComponentProps<
  Content.FooterColumnLinksSlice,
  EviFooterSliceContext
>): React.ReactElement | null {
  const { primary } = slice;
  const { linkResolver } = context;

  const has_links = (primary.links ?? []).some(is_link_filled);
  if (!has_rich_text(primary.heading) && !has_links) return null;

  return (
    <EviStack gap="md" data-slot="footer-column" data-variant="links">
      <EviTitle field={primary.heading} linkResolver={linkResolver} />
      <FooterLinkList items={primary.links} linkResolver={linkResolver} />
    </EviStack>
  );
}
