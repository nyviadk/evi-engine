import { isFilled, type ImageField } from "@prismicio/client";
import { EviImage, type EviImageProps } from "@/src/components/ui/EviImage";
import { cn } from "@/src/lib/utils/cn";
import { resolve_surface } from "@/src/lib/utils/surface";

type BackdropForm = "none" | "rotated";

// Prismic-label (backdrop-select) → dekorativ FORM bag billedet. Legacy FARVE-labels
// (Sekundær/Primær fra før forms) → rotated, så gammelt indhold stadig renderer.
export const BACKDROP_FROM_LABEL: Record<string, BackdropForm> = {
  Ingen: "none",
  Roteret: "rotated",
  Sekundær: "rotated",
  Primær: "rotated",
};

const formClass: Record<Exclude<BackdropForm, "none">, string> = {
  rotated: "inset-[3%] -rotate-3 rounded-evi",
};

export type EviBackdropImageProps = {
  /** Billede — brug samme constraint som `aspectRatio`. Tomt → intet render. */
  field: ImageField;
  /**
   * Separat mobil-billede (art direction, R9.8). Når udfyldt vises det < 768px
   * i 4:3 i stedet for et fuld-bredt kvadrat der ellers dominerer på mobil.
   */
  mobileField?: ImageField;
  /**
   * Dekorativ form bag billedet, eller "none" for et plain afrundet billede.
   * Udvid via `formClass` + `BACKDROP_FROM_LABEL`. @default "rotated"
   */
  backdrop?: BackdropForm;
  /**
   * Backdrop-farve (Prismic-label: "Sekundær"/"Primær"/"Neutral"). Ignoreres når
   * `backdrop="none"`. Opløses via `resolve_surface`. @default "Sekundær"
   */
  color?: string;
  /** Eager-load (LCP/hero-billede). @default false */
  priority?: boolean;
  /**
   * Billedforhold på desktop. `mobileField` overstyrer stadig mobil til 4:3.
   * @default "square"
   */
  aspectRatio?: EviImageProps["aspectRatio"];
  className?: string;
};

/**
 * Billede (forhold via `aspectRatio`, default kvadratisk) med en valgfri dekorativ
 * form bagved (roteret flap, blob, cirkel …) → giver dybde. Formen er aria-hidden
 * og holdes INDE i boksen via proportional padding (% af bredden), så intet
 * overflower. `backdrop="none"` → bare det afrundede billede. `mobileField` → 4:3
 * på mobil.
 */
export function EviBackdropImage({
  field,
  mobileField,
  backdrop = "rotated",
  color = "Sekundær",
  priority = false,
  aspectRatio = "square",
  className,
}: EviBackdropImageProps): React.ReactElement | null {
  if (!isFilled.image(field)) return null;

  const has_mobile = isFilled.image(mobileField);

  const image = (
    <EviImage
      field={field}
      mobileField={mobileField}
      aspectRatio={aspectRatio}
      mobileAspectRatio={has_mobile ? "landscape" : undefined}
      variant="plain"
      imageClassName="object-cover"
      priority={priority}
      sizes="(min-width: 768px) 45vw, 92vw"
      className="shadow-evi rounded-evi"
    />
  );

  if (backdrop === "none") {
    return (
      <div data-slot="evi-backdrop-image" data-backdrop="none" className={className}>
        {image}
      </div>
    );
  }

  return (
    <div
      data-slot="evi-backdrop-image"
      data-backdrop={backdrop}
      className={cn("relative isolate w-full p-[5%]", className)}
    >
      <div
        aria-hidden
        className={cn("absolute -z-10", resolve_surface(color), formClass[backdrop])}
      />
      {image}
    </div>
  );
}
