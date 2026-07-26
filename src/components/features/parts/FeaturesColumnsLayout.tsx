import { isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviAutoGrid } from "@/src/components/layout/EviAutoGrid";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviIcon } from "@/src/components/ui/EviIcon";
import { EviRichText } from "@/src/components/typography/EviRichText";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

// Fast 4 kolonner som [ikon, tekst]-par (navngivne felter, ikke repeatable).
function get_columns(p: Content.FeaturesSliceDefaultPrimary) {
  return [
    { key: "1", icon: p.feature_1_icon, text: p.feature_1_text },
    { key: "2", icon: p.feature_2_icon, text: p.feature_2_text },
    { key: "3", icon: p.feature_3_icon, text: p.feature_3_text },
    { key: "4", icon: p.feature_4_icon, text: p.feature_4_text },
  ];
}

export type FeaturesColumnsLayoutProps = {
  slice: Content.FeaturesSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

/**
 * Trust-bar: fire ikon+tekst-kolonner. Grid skalerer 1 → 2 → 4 (aldrig 3, så
 * en enlig kolonne aldrig efterlades). Domain-part (Tailwind tilladt, R3.3).
 */
export function FeaturesColumnsLayout({
  slice,
  index,
  context,
}: FeaturesColumnsLayoutProps): React.ReactElement {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );

  // Kun kolonner med tekst — ikon uden tekst giver ingen mening.
  const columns = get_columns(slice.primary).filter((c) =>
    isFilled.richText(c.text),
  );

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="features"
    >
      <EviAutoGrid size="quad">
        {columns.map((c, i) => (
          <EviStack
            key={i}
            direction="row"
            align="center"
            justify="center"
            gap="sm"
          >
            {isFilled.keyText(c.icon) && (
              <EviIcon
                name={c.icon}
                className="size-6 shrink-0 text-evi-secondary"
              />
            )}
            <EviRichText
              field={c.text}
              linkResolver={linkResolver}
              className="text-sm [&_p]:m-0 [&_p]:font-medium"
            />
          </EviStack>
        ))}
      </EviAutoGrid>
    </EviSection>
  );
}
