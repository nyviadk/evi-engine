import { isFilled, type ImageField } from "@prismicio/client";

import { EviStack } from "@/src/components/layout/EviStack";
import { EviImage } from "@/src/components/ui/EviImage";

export type StaggeredImagesProps = {
  /** Op til 4 billeder — lige indeks i venstre kolonne, ulige i højre. */
  images: ImageField[];
  /** Eager-load det FØRSTE billede (kun når klyngen er above-the-fold/hero). */
  priority?: boolean;
};

/**
 * Forskudt billed-klynge (Collage/Duo): to kolonner hvor højre kolonne er skubbet
 * ned, så billederne "trapper". Bygget af EviStack på BEGGE akser med samme
 * `gap="lg"` → kolonne-gap == række-gap. Tomme felter springes over → 1–4 billeder
 * virker. Billederne er dekorative (ingen fokuserbare børn), så kolonne-opdelingen
 * ændrer ikke fokus/læse-rækkefølgen. Domain-part (Tailwind tilladt, R3.3).
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
    <EviStack rowFrom="md" gap="lg" align="start">
      <EviStack gap="lg" className="flex-1">
        {left.map((f, i) => img(f, priority && i === 0))}
      </EviStack>
      {right.length > 0 && (
        <EviStack gap="lg" className="flex-1 md:mt-12">
          {right.map((f) => img(f, false))}
        </EviStack>
      )}
    </EviStack>
  );
}
