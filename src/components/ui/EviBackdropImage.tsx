import { isFilled, type ImageField } from "@prismicio/client";
import { EviImage } from "@/src/components/ui/EviImage";
import { cn } from "@/src/lib/utils/cn";

type Backdrop = "primary" | "secondary";

// Blød, nedtonet token-tint bag billedet — samme "blød"-baggrund som section-
// temaerne "Primær/Sekundær blød" (solid color-mix, IKKE gradient). Følger
// tenantens brand-farver, så den er blød på lyse brands og dæmpet på mørke.
const backdropClass: Record<Backdrop, string> = {
  primary: "theme-primary-soft",
  secondary: "theme-secondary-soft",
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
 * Baggrunden er dekorativ (aria-hidden). Rotationen kan stikke lidt ud; hold
 * den i en container der clipper vandret (EviSection gør det) for at undgå
 * vandret scroll på mobil. Valgfrit `mobileField` → 4:3-crop < 768px.
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
      className={cn("relative isolate mx-auto w-full max-w-lg", className)}
    >
      <div
        aria-hidden
        className={cn(
          // -inset-3: lidt større end billedet så tinten peeker jævnt rundt.
          // -rotate-3: lille vinkel → blid dybde (ikke en skæv "kort"-effekt).
          "absolute -inset-3 -z-10 -rotate-3 rounded-evi",
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
        className="rounded-evi shadow-xl"
      />
    </div>
  );
}
