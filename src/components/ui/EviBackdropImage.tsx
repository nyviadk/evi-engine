import { isFilled, type ImageField } from "@prismicio/client";
import { EviImage } from "@/src/components/ui/EviImage";
import { cn } from "@/src/lib/utils/cn";

type BackdropForm = "none" | "rotated";

// Prismic-label (backdrop-select) → dekorativ FORM bag billedet. DELT af alle
// slices med et backdrop-valg (hero/split, features/split) → samme forms overalt.
// SKALÉR MED FLERE FORMER senere: (1) ny option i select-modellen, (2) ny nøgle
// her + i BackdropForm-typen, (3) entry i formClass. Legacy FARVE-labels
// (Sekundær/Primær fra før forms) → rotated, så gammelt indhold stadig renderer.
export const BACKDROP_FROM_LABEL: Record<string, BackdropForm> = {
  Ingen: "none",
  Roteret: "rotated",
  Sekundær: "rotated",
  Primær: "rotated",
};

// Formens position/rotation/afrunding.
const formClass: Record<Exclude<BackdropForm, "none">, string> = {
  rotated: "inset-[3%] -rotate-3 rounded-evi",
};

// Backdrop-FARVE (Prismic-label) → surface-tint på formen. Kontrast-adaptive
// brand-tints (blød på lys, dæmpet på mørk) — IKKE theme-*-soft (solid lys →
// grelt på mørke sektioner). DELT af alle slices med et backdrop-farvevalg.
export const BACKDROP_COLOR_CLASS: Record<string, string> = {
  Sekundær: "theme-surface-secondary",
  Primær: "theme-surface-primary",
  Neutral: "theme-surface-neutral",
};

export type EviBackdropImageProps = {
  /** Billede (kvadratisk constraint anbefales). Tomt → intet render. */
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
   * `backdrop="none"`. Udvid via `BACKDROP_COLOR_CLASS`. @default "Sekundær"
   */
  color?: string;
  /** Eager-load (LCP/hero-billede). @default false */
  priority?: boolean;
  className?: string;
};

/**
 * Kvadratisk billede med en valgfri dekorativ form bagved (roteret flap, blob,
 * cirkel …) → giver dybde. Formen er aria-hidden og holdes INDE i boksen via
 * proportional padding (% af bredden), så intet overflower. `backdrop="none"` →
 * bare det afrundede billede. `mobileField` → 4:3 på mobil.
 */
export function EviBackdropImage({
  field,
  mobileField,
  backdrop = "rotated",
  color = "Sekundær",
  priority = false,
  className,
}: EviBackdropImageProps): React.ReactElement | null {
  if (!isFilled.image(field)) return null;

  const has_mobile = isFilled.image(mobileField);

  const image = (
    <EviImage
      field={field}
      mobileField={mobileField}
      aspectRatio="square"
      mobileAspectRatio={has_mobile ? "landscape" : undefined}
      variant="plain"
      imageClassName="object-cover"
      priority={priority}
      sizes="(min-width: 768px) 45vw, 92vw"
      className="shadow-evi rounded-evi"
    />
  );

  // "none" → ingen form, bare det afrundede billede.
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
        className={cn(
          "absolute -z-10",
          BACKDROP_COLOR_CLASS[color] ?? "theme-surface-secondary",
          formClass[backdrop],
        )}
      />
      {image}
    </div>
  );
}
