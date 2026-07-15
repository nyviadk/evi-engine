import { isFilled, type ImageField } from "@prismicio/client";
import { EviImage } from "@/src/components/ui/EviImage";
import { cn } from "@/src/lib/utils/cn";

type Backdrop = "primary" | "secondary";

// Blød brand-tint bag billedet. Bruger theme-surface-* (transparent brand-mix)
// IKKE theme-*-soft: soft er en SOLID lys farve (brand + --color-light), som
// bliver et grelt lyst "papir" på mørke sektioner. surface lægger sig adaptivt
// oven på sektionens egen baggrund → blød på lys, dæmpet på mørk. Ikke gradient.
const backdropClass: Record<Backdrop, string> = {
  primary: "theme-surface-primary",
  secondary: "theme-surface-secondary",
};

export type EviBackdropImageProps = {
  /** Billede (kvadratisk constraint anbefales). Tomt → intet render. */
  field: ImageField;
  /**
   * Separat mobil-billede (art direction, R9.8). Når udfyldt vises det < 768px
   * i 4:3 i stedet for et fuld-bredt kvadrat der ellers dominerer på mobil.
   * Tomt → desktop-billedet (square) bruges på alle viewports.
   */
  mobileField?: ImageField;
  /** Blød farve på den roterede baggrund bag billedet. @default "secondary" */
  backdrop?: Backdrop;
  /** Eager-load (LCP/hero-billede). @default false */
  priority?: boolean;
  className?: string;
};

/**
 * Kvadratisk billede med en blød, let roteret farve-flade bagved → giver dybde.
 * Baggrunden er dekorativ (aria-hidden). Fylder hele kolonnen; flappen + dens
 * rotation holdes INDE i boksen via proportional padding (% af bredden), så
 * intet overflower — ingen afhængighed af vandret clip. `mobileField` → 4:3.
 */
export function EviBackdropImage({
  field,
  mobileField,
  backdrop = "secondary",
  priority = false,
  className,
}: EviBackdropImageProps): React.ReactElement | null {
  if (!isFilled.image(field)) return null;

  const has_mobile = isFilled.image(mobileField);

  return (
    <div
      data-slot="evi-backdrop-image"
      className={cn("relative isolate w-full p-[5%]", className)}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-[3%] -z-10 -rotate-3 rounded-evi",
          backdropClass[backdrop],
        )}
      />
      <EviImage
        field={field}
        mobileField={mobileField}
        aspectRatio="square"
        mobileAspectRatio={has_mobile ? "landscape" : undefined}
        variant="plain"
        imageClassName="object-cover"
        priority={priority}
        sizes="(min-width: 768px) 45vw, 92vw"
        className="rounded-evi shadow-evi"
      />
    </div>
  );
}
