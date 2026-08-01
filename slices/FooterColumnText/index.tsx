import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import type { EviFooterSliceContext } from "@/src/components/footer/types";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviTitle } from "@/src/components/typography/EviTitle";
import { EviStack } from "@/src/components/layout/EviStack";
import { has_rich_text } from "@/src/lib/prismic/fields";

/**
 * A single footer column: heading + rich-text body. For company info
 * (address, CVR, opening hours) — content that isn't a navigation link list.
 */
export default function FooterColumnText({
  slice,
  context,
}: SliceComponentProps<
  Content.FooterColumnTextSlice,
  EviFooterSliceContext
>): React.ReactElement | null {
  const { primary } = slice;
  const { linkResolver } = context;

  if (!has_rich_text(primary.heading, primary.body)) return null;

  return (
    <EviStack gap="md" data-slot="footer-column" data-variant="text">
      <EviTitle field={primary.heading} linkResolver={linkResolver} />
      {/* Afsnits-afstand = gap-2 (8px), så flere linjer matcher links-kolonnens
          rytme i stedet for prose'ens brede afsnits-margin. */}
      <EviRichText
        field={primary.body}
        linkResolver={linkResolver}
        className="[&_p]:my-0 [&_p+p]:mt-2"
      />
    </EviStack>
  );
}
