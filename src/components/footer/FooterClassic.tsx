import { SliceZone } from "@prismicio/react";
import { isFilled } from "@prismicio/client";

import { BrandLink } from "@/src/components/header/parts/BrandLink";
import { FooterLinkList } from "@/src/components/footer/parts/FooterLinkList";
import { EviSection } from "@/src/components/layout/EviSection";
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
 * Classic footer layout.
 *
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │ brand+info  │  col1     col2     col3    (auto-wrap on narrow)
 *  │             │  col4     col5                                │
 *  ├─────────────────────────────────────────────────────────────┤
 *  │ copyright text                    legal · privacy · terms   │
 *  └─────────────────────────────────────────────────────────────┘
 *
 * Left cell: brand mark + short company blurb from Prismic.
 * Right cell: SliceZone renders tenant's column slices (Links / Text)
 * inside a CSS grid using `auto-fit + minmax` — genuinely dynamic wrap
 * without hardcoded breakpoints or a "column count" field.
 * Bottom row: editable copyright (Rich Text) + legal-links row.
 *
 * ALL text on this page flows through EviRichText or PrismicNextLink — no
 * hardcoded `<h1>`-`<h6>`/`<p>` tags in JSX. Rich Text fields are locked in
 * the Prismic model to the correct block type so editors can't emit the
 * wrong heading level (which would drift from evi-prose typography tokens).
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
    <footer data-slot="evi-footer" data-variant="classic">
      <EviSection theme="dark">
        {/* Brand block — left on desktop (4/12), full row on mobile */}
        <div className="@3xl/section:col-span-4 col-span-12">
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
        </div>

        {/* Columns grid — right on desktop (8/12), full row on mobile.
            grid-cols-[repeat(auto-fit,minmax(180px,1fr))] wraps naturally:
            at container widths that can't fit N × 180px, columns drop to
            new rows without any media queries. */}
        {has_columns && (
          <div className="@3xl/section:col-span-8 col-span-12">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-8 gap-y-10">
              <SliceZone
                slices={footer.data.columns}
                components={FOOTER_COLUMN_COMPONENTS}
                context={slice_context}
              />
            </div>
          </div>
        )}

        {/* Bottom row: copyright + legal links. Skips render entirely if
            neither is filled — no orphan border, no empty spacing. */}
        {has_bottom_row && (
          <EviStack
            direction="row"
            wrap
            gap="md"
            className="col-span-12 items-center justify-between border-t border-current/10 pt-6"
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
        )}
      </EviSection>
    </footer>
  );
}
