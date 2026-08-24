import { cn } from "@/src/lib/utils/cn";

type CoverOverlay = "dark" | "light" | "primary" | "secondary";

// Prismic-label (overlay_color-select) → overlay-nøgle. Hold synk med modellen.
export const OVERLAY_FROM_LABEL: Record<string, CoverOverlay> = {
  Mørk: "dark",
  Lys: "light",
  Primær: "primary",
  Sekundær: "secondary",
};

// Overlay → { tema-klasse: giver korrekte tekst/knap-tokens til indholdet ovenpå
// (dens malede baggrund er harmløs — billedet dækker den); scrim: bund-vægtet
// GRADIENT — kraftig (/90) i bunden hvor indholdet står (klar kontrast), fader op
// til næsten klart (/10) foroven så billedet er tydeligt. Samme retning/mønster
// som FeaturesBento (`to-t` = from ⇒ bund). Et svagt scrim var usynligt.
const OVERLAY: Record<CoverOverlay, { theme: string; scrim: string }> = {
  dark: {
    theme: "theme-dark",
    scrim: "bg-linear-to-t from-evi-dark/90 via-evi-dark/55 to-evi-dark/10",
  },
  light: {
    theme: "theme-light",
    scrim: "bg-linear-to-t from-evi-light/95 via-evi-light/65 to-evi-light/15",
  },
  primary: {
    theme: "theme-primary",
    scrim:
      "bg-linear-to-t from-evi-primary/90 via-evi-primary/55 to-evi-primary/10",
  },
  secondary: {
    theme: "theme-secondary",
    scrim:
      "bg-linear-to-t from-evi-secondary/90 via-evi-secondary/55 to-evi-secondary/10",
  },
};

export type EviCoverSectionProps = Omit<
  React.ComponentProps<"section">,
  "children"
> & {
  /** Full-bleed billed-lag (edge-to-edge, bag alt). Part'en styrer priority + art-direction. */
  image: React.ReactNode;
  /** Overlay-farve → tema-tokens (tekst/knapper) + nedtonet scrim. @default "dark" */
  overlay?: CoverOverlay;
  children: React.ReactNode;
};

/**
 * Full-bleed cover-sektion: ét fuld-bredde billede (edge-to-edge) under et nedtonet
 * scrim, med indhold i sitets normale container-bredde ovenpå.
 *
 * Højden er AFGRÆNSET fluid — `clamp(28rem, 72svh, 46rem)`: min-cap så den er
 * substantiel på korte skærme, `svh` så mobil-chrome ikke overflower, max-cap så
 * den ikke bliver absurd høj på store/zoomede skærme. Billedet frikobler højde fra
 * bredde via `object-cover` (det beskærer — dikterer ikke), så det aldrig vokser
 * ukontrolleret på brede skærme. `overlay` sætter både tekst/knap-tokens og scrim.
 *
 * Layout-primitiv (components/layout) → rå position/flex hører hjemme her.
 */
export function EviCoverSection({
  image,
  overlay = "dark",
  className,
  children,
  ...props
}: EviCoverSectionProps): React.ReactElement {
  const o = OVERLAY[overlay];
  return (
    <section
      data-slot="evi-cover-section"
      data-overlay={overlay}
      className={cn(
        o.theme,
        // items-end: indholdet ankres i bunden, hvor bund-gradienten er stærkest
        // (bedst kontrast) og billedet er frit foroven — klassisk full-bleed-hero.
        "relative isolate flex min-h-[clamp(28rem,80svh,45rem)] w-full items-end overflow-hidden",
        className,
      )}
      {...props}
    >
      {/* Billed-laget fylder ALTID hele sektionen: `*:size-full` tvinger barnet
          (EviImage-containeren) til fuld højde+bredde, uanset dets props. */}
      <div
        data-slot="cover-image"
        className="absolute inset-0 -z-10 *:size-full"
      >
        {image}
      </div>
      <div aria-hidden className={cn("absolute inset-0", o.scrim)} />
      <div className="relative z-10 mx-auto w-full max-w-evi px-4 py-16 md:py-24">
        {children}
      </div>
    </section>
  );
}
