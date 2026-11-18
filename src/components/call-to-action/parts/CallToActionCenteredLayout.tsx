import { isFilled, type Content } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";

import { EviRow } from "@/src/components/layout/EviRow";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviStoreButtons } from "@/src/components/ui/EviStoreButton";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { has_link } from "@/src/lib/prismic/links";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

export type CallToActionCenteredLayoutProps = {
  slice: Content.CallToActionSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

// Ikon-feltet har ingen constraint (logo-rollen, R9.1); højden styrer srcset.
const ICON_HEIGHT_PX = 64;

/**
 * CallToAction "default": centreret afslutning med valgfrit ikon, overskrift,
 * tekst og to knapper. App Store- og Google Play-links bliver butiksknapper.
 * Domain-part (Tailwind tilladt, R3.3).
 */
export function CallToActionCenteredLayout({
  slice,
  index,
  context,
}: CallToActionCenteredLayoutProps): React.ReactElement | null {
  const { linkResolver, lang } = context;
  const { theme, isHero, collapsePadding, eagerImages } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  if (
    !has_rich_text(p.heading, p.body) &&
    !has_link(p.cta_link, p.cta_link_secondary)
  ) {
    return null;
  }

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="call-to-action"
    >
      <EviRow>
        <EviStack gap="lg" align="center">
          {isFilled.image(p.image) && (
            <PrismicNextImage
              field={p.image}
              height={ICON_HEIGHT_PX}
              fallbackAlt=""
              loading={eagerImages ? "eager" : undefined}
              className="h-16 w-auto max-w-full rounded-evi object-contain"
            />
          )}
          <EviHeadingGroup
            title={p.heading}
            description={p.body}
            linkResolver={linkResolver}
            isHero={isHero}
            align="center"
          />
          <EviStoreButtons
            primary={p.cta_link}
            secondary={p.cta_link_secondary}
            linkResolver={linkResolver}
            lang={lang}
            qr={p.show_qr}
          />
        </EviStack>
      </EviRow>
    </EviSection>
  );
}
