import { type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviBox } from "@/src/components/ui/EviBox";
import { EviIconRow } from "@/src/components/ui/EviIconRow";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { evi_list_text_class } from "@/src/lib/utils/card-text";
import { cn } from "@/src/lib/utils/cn";

// Prismic-label → EviSplit vertikal-align. Default centreret (uændret adfærd);
// "Øverst" bruges når boksen er højere end teksten og centrering ser skæv ud.
const CONTENT_ALIGN: Record<string, "start" | "center"> = {
  Centreret: "center",
  Øverst: "start",
};

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
 * `[brødtekst | boks]`-række hvis lodrette align `content_align` styrer (default
 * `Centreret` — boksens midte flugter med brødtekstens; `Øverst` når boksen er
 * højere end teksten). Boks-rækkerne genbruger
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
  const contentAlign = CONTENT_ALIGN[p.content_align ?? "Centreret"] ?? "center";

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
        <EviSplit preset="50-50" align={contentAlign}>
          <EviRichText
            field={p.body}
            linkResolver={linkResolver}
            className="[&>p]:max-w-prose"
          />
          {points.length > 0 && (
            <EviBox surface={p.box_color}>
              <EviStack gap="lg">
                {points.map((pt, i) => (
                  <EviIconRow
                    key={i}
                    icon={pt.icon}
                  >
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
                  </EviIconRow>
                ))}
              </EviStack>
            </EviBox>
          )}
        </EviSplit>
      </EviRow>
    </EviSection>
  );
}
