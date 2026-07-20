import { asText, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviBox } from "@/src/components/ui/EviBox";
import { EviIconBadge } from "@/src/components/ui/EviIconBadge";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { evi_list_text_class } from "@/src/lib/utils/card-text";
import { cn } from "@/src/lib/utils/cn";

export type HighlightsLayoutProps = {
  slice: Content.HighlightsSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

/**
 * Highlights: intro (titel + brødtekst) i venstre kolonne, en boks med
 * ikon-punkter i højre.
 *
 * Det særlige: boksen centreres lodret mod BRØDTEKSTEN — ikke titel+tekst.
 * Titlen begrænses til venstre kolonnes bredde og sidder øverst; derunder en
 * `[brødtekst | boks]`-række med `items-center`, så boksens midte flugter med
 * brødtekstens (titlen trækker ikke midten skævt op). Boks-rækkerne genbruger
 * FeaturesSplit's ikon-række-mønster. Domain-part (Tailwind tilladt, R3.3).
 */
export function HighlightsLayout({
  slice,
  index,
  context,
}: HighlightsLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  // Kun punkter med tekst — tomme group-rækker rendres ikke.
  const points = (p.points ?? []).filter((pt) =>
    has_rich_text(pt.title, pt.body),
  );
  if (!has_rich_text(p.heading, p.body) && points.length === 0) {
    return null;
  }

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="highlights"
    >
      {/* Egen 12-kol-grid (ikke sektionens) → EviSplit kan subgride på den, OG
          vi styrer selv gap-y, så titlen sidder tæt på brødteksten. */}
      <EviRow className="grid grid-cols-12 gap-x-4 gap-y-6 @3xl/section:gap-x-16">
        <div className="col-span-12 @3xl/section:col-span-6">
          <EviHeadingGroup
            title={p.heading}
            linkResolver={linkResolver}
            isHero={isHero}
          />
        </div>
        <EviSplit preset="50-50" align="center">
          <EviRichText
            field={p.body}
            linkResolver={linkResolver}
            className="[&>p]:max-w-prose"
          />
          {points.length > 0 ? (
            <EviBox surface={p.box_color}>
              <EviStack gap="lg">
                {points.map((pt) => (
                  <EviStack
                    key={asText(pt.title) || asText(pt.body)}
                    direction="row"
                    gap="md"
                    align="start"
                  >
                    <EviIconBadge name={pt.icon} />
                    <div className={cn("evi-prose", evi_list_text_class())}>
                      <EviRichText.Raw
                        field={pt.title}
                        linkResolver={linkResolver}
                      />
                      <EviRichText.Raw
                        field={pt.body}
                        linkResolver={linkResolver}
                      />
                    </div>
                  </EviStack>
                ))}
              </EviStack>
            </EviBox>
          ) : null}
        </EviSplit>
      </EviRow>
    </EviSection>
  );
}
