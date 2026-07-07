import { SliceZone } from "@prismicio/react";
import { isFilled } from "@prismicio/client";

import { BrandLink } from "@/src/components/header/parts/BrandLink";
import { FooterLinkList } from "@/src/components/footer/parts/FooterLinkList";
import { EviAutoGrid } from "@/src/components/layout/EviAutoGrid";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviRichText } from "@/src/components/typography/EviRichText";
import type { EviContext } from "@/src/lib/prismic/context";
import type { EviFooterSliceContext } from "@/src/components/footer/types";
import FooterColumnLinks from "@/slices/FooterColumnLinks";
import FooterColumnText from "@/slices/FooterColumnText";

const FOOTER_COLUMN_COMPONENTS = {
  footer_column_links: FooterColumnLinks,
  footer_column_text: FooterColumnText,
};

export type FooterClassicProps = {
  footer: NonNullable<EviContext["footer"]>;
  settings: EviContext["settings"];
  linkResolver: EviContext["link_resolver"];
  hostname: string;
  homeHref: string;
  allowBrandTranslation: boolean;
};

/**
 * Classic footer layout — pure Evi component composition.
 *
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │ brand+info  │  col1     col2     col3    (auto-wrap)        │
 *  │             │  col4     col5                                │
 *  ├─────────────────────────────────────────────────────────────┤
 *  │ copyright text                    legal · privacy · terms   │
 *  └─────────────────────────────────────────────────────────────┘
 *
 * All layout via Evi primitives:
 *  - EviSection      → dark-themed section frame
 *  - EviSplit 33-67  → brand pane (left) + columns pane (right)
 *  - EviAutoGrid fluid → columns auto-fit + wrap
 *  - EviRow          → bottom band with top-divider
 *  - EviStack        → flex row/col with align/justify
 *  - EviRichText     → copyright text
 *  - BrandLink       → brand mark (image or text)
 *  - FooterLinkList  → semantic list of links
 *
 * No raw Tailwind classes, no free JSX. Rule of thumb: if a line has
 * a `className` that isn't just a data-slot passthrough, something is wrong.
 */
export function FooterClassic({
  footer,
  settings,
  linkResolver,
  hostname,
  homeHref,
  allowBrandTranslation,
}: FooterClassicProps): React.ReactElement {
  const has_columns = footer.data.columns.length > 0;
  const has_copyright = isFilled.richText(footer.data.copyright);
  const has_legal_links = footer.data.legal_links.some((l) =>
    isFilled.link(l),
  );
  const has_bottom_row = has_copyright || has_legal_links;

  const slice_context: EviFooterSliceContext = { linkResolver };

  return (
    <EviSection theme="dark" data-slot="evi-footer" data-variant="classic">
      <EviSplit preset="33-67" align="start">
        <EviStack gap="md">
          <BrandLink
            logo={footer.data.logo}
            siteName={settings?.data?.site_name}
            hostname={hostname}
            homeHref={homeHref}
            allowTranslation={allowBrandTranslation}
            imageHeightClass="h-10"
          />
          <EviRichText
            field={footer.data.info_text}
            linkResolver={linkResolver}
          />
        </EviStack>

        {has_columns ? (
          <EviAutoGrid size="fluid">
            <SliceZone
              slices={footer.data.columns}
              components={FOOTER_COLUMN_COMPONENTS}
              context={slice_context}
            />
          </EviAutoGrid>
        ) : (
          <EviStack />
        )}
      </EviSplit>

      {has_bottom_row && (
        <EviRow divider="top" padding="md">
          <EviStack
            direction="row"
            wrap
            gap="md"
            align="center"
            justify="between"
          >
            {has_copyright && (
              <EviRichText
                field={footer.data.copyright}
                linkResolver={linkResolver}
              />
            )}
            {has_legal_links && (
              <FooterLinkList
                items={footer.data.legal_links}
                linkResolver={linkResolver}
                direction="row"
                wrap
              />
            )}
          </EviStack>
        </EviRow>
      )}
    </EviSection>
  );
}
