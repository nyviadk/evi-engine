import { isFilled, type ImageField } from "@prismicio/client";

import { EviImage } from "@/src/components/ui/EviImage";

export type StaggeredImagesProps = {
  /** Op til 4 billeder — lige indeks i venstre kolonne, ulige i højre. */
  images: ImageField[];
  /** Eager-load det FØRSTE billede (kun når klyngen er above-the-fold/hero). */
  priority?: boolean;
};

/**
 * Forskudt billed-klynge (Collage/Duo): to kolonner hvor højre er skubbet ned, så
 * billederne "trapper". Container-query-grid der beholder 2 kolonner ned til 300px
 * og først falder til 1 kolonne derunder (EviAutoGrids kort-breakpoint @532px er
 * for højt til smalle billeder). Gap følger systemets normale md-breakpoint
 * (gap-4 → md:gap-6, som fx EviAutoGrid card); begge akser skifter samtidig, så
 * kolonne-gap == række-gap ved alle bredder. EviStack kan ikke responsivt gap, så
 * kolonnerne er flex her (domain-part, Tailwind tilladt, R3.3). Billederne er
 * dekorative → kolonne-opdelingen ændrer ikke fokus/læse-rækkefølgen.
 */
export function StaggeredImages({
  images,
  priority = false,
}: StaggeredImagesProps): React.ReactElement | null {
  const filled = images.filter((img) => isFilled.image(img));
  if (filled.length === 0) return null;

  const left = filled.filter((_, i) => i % 2 === 0);
  const right = filled.filter((_, i) => i % 2 === 1);

  // Kun ÉT billede må være priority (LCP) — flere eager raw-JPEG'er skader LCP.
  const img = (field: ImageField, eager: boolean): React.ReactElement => (
    <EviImage
      key={field.url}
      field={field}
      aspectRatio="3:4"
      variant="plain"
      imageClassName="object-cover"
      sizes="(min-width: 768px) 23vw, 46vw"
      className="shadow-evi"
      priority={eager}
    />
  );

  return (
    <div data-slot="staggered-images" className="@container/imgs">
      <div className="grid grid-cols-1 gap-4 md:gap-6 @[300px]/imgs:grid-cols-2">
        <div className="flex flex-col gap-4 md:gap-6">
          {left.map((f, i) => img(f, priority && i === 0))}
        </div>
        {right.length > 0 && (
          <div className="flex flex-col gap-4 md:gap-6 @[300px]/imgs:mt-12">
            {right.map((f) => img(f, false))}
          </div>
        )}
      </div>
    </div>
  );
}
