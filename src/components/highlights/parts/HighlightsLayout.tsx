import { asText, isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviIcon } from "@/src/components/ui/EviIcon";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { cn } from "@/src/lib/utils/cn";

// box_color → boks-flade (samme mønster som features cards/split).
const BOX_SURFACE: Record<string, string> = {
  Neutral: "theme-surface-neutral",
  Primær: "theme-surface-primary",
  Sekundær: "theme-surface-secondary",
};

export type HighlightsLayoutProps = {
  slice: Content.SectionHighlightsSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

/**
 * SectionHighlights: intro (titel + brødtekst) i venstre kolonne, en boks med
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
  const points = (p.points ?? []).filter(
    (pt) => isFilled.richText(pt.title) || isFilled.richText(pt.body),
  );
  const boxSurface =
    BOX_SURFACE[p.box_color ?? "Neutral"] ?? BOX_SURFACE.Neutral;

  if (
    !isFilled.richText(p.heading) &&
    !isFilled.richText(p.body) &&
    points.length === 0
  ) {
    return null;
  }

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="section-highlights"
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
            <div
              className={cn(boxSurface, "rounded-evi p-6 shadow-evi md:p-8")}
            >
              <EviStack gap="lg">
                {points.map((pt) => (
                  <EviStack
                    key={asText(pt.title) || asText(pt.body)}
                    direction="row"
                    gap="md"
                    align="start"
                  >
                    {isFilled.keyText(pt.icon) && (
                      <span className="inline-flex shrink-0 rounded-full bg-evi-secondary p-2">
                        <EviIcon
                          name={pt.icon}
                          className="size-5 text-evi-text-on-secondary"
                        />
                      </span>
                    )}
                    <div className="evi-prose [&_h3]:m-0 [&_h3]:text-base [&_h3]:font-semibold [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-sm">
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
            </div>
          ) : null}
        </EviSplit>
      </EviRow>
    </EviSection>
  );
}
