import { isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviImage } from "@/src/components/ui/EviImage";
import { PlanioSky, type PlanioSkyStar } from "@/src/components/planio/PlanioSky";
import { has_rich_text } from "@/src/lib/prismic/fields";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

// Stjerner i top- og bundluften og ved kanterne, så sektionen og roadmappen under
// står som én himmel. Faste afstande i top og bund: i procent rykker de ind i
// indholdet, når sektionen bliver høj på mobil. Kanternes stjerner kun fra md.
const STARS: PlanioSkyStar[] = [
  { position: "left-[3%] top-10", big: true, wide: true },
  { position: "left-[22%] top-6" },
  { position: "left-[49%] top-14", wide: true },
  { position: "left-[63%] top-8" },
  { position: "left-[93%] top-12", big: true },
  { position: "left-[97%] top-[55%]", wide: true },
  { position: "left-[58%] bottom-10" },
  { position: "left-[8%] bottom-6", wide: true },
  { position: "left-[41%] bottom-8", big: true, wide: true },
];

export type PlanioAboutLayoutProps = {
  slice: Content.PlanioAboutSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

/**
 * planio_about "default": "Om os" som TextWithImages (fotoet til venstre,
 * øverst på mobil) under en stjernehimmel. Domain-part (Tailwind tilladt, R3.3).
 */
export function PlanioAboutLayout({
  slice,
  index,
  context,
}: PlanioAboutLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(context, index);
  const p = slice.primary;

  if (!has_rich_text(p.heading, p.body) && !isFilled.image(p.image)) return null;

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      // Stjernehimlen placeres i forhold til sektionen og klippes ved dens kant.
      className="relative overflow-hidden"
      data-slot="planio-about"
    >
      <PlanioSky stars={STARS} />
      {/* Teksten først i DOM'en; fotoet flyttes kun visuelt til venstre/øverst. */}
      <EviSplit preset="50-50" align="center" reverse mobileReverse>
        <EviHeadingGroup
          title={p.heading}
          description={p.body}
          linkResolver={linkResolver}
          isHero={isHero}
        />
        <EviImage
          field={p.image}
          aspectRatio="landscape"
          sizes="(min-width: 768px) 45vw, 92vw"
          priority={isHero}
          variant="plain"
          imageClassName="object-cover"
        />
      </EviSplit>
    </EviSection>
  );
}
