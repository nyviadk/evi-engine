import { isFilled, type ImageField } from "@prismicio/client";
import type { CSSProperties } from "react";
import { EviPhoneMockup } from "@/src/components/ui/EviPhoneMockup";
import { cn } from "@/src/lib/utils/cn";

/**
 * Desktop-komposition. Carousel/komposition-skiftet er CONTAINER-baseret
 * (@container/phones), ikke viewport: i en smal split-kolonne forbliver den
 * carousel, og folder først kompositionen ud når containeren er bred nok.
 * Hver værdi svarer 1-1 til et look fra "EviPhoneMockup — variationer".
 */
type PhoneLayout =
  | "row" // ren række (og solo når fields=1)
  | "tilted" // par der hælder mod hinanden (±6°)
  | "fan" // vifte, origin center (±12°, overlap)
  | "fan-top" // håndvifte, origin top (±12°, tops aligned)
  | "back-to-back" // 3D rotateY udad (±25°)
  | "perspective" // 3D rotateY 18° på hver
  | "floating" // skewY + drop-shadow
  | "masked"; // vifte i gradient-boks, bund clippet

/**
 * Baggrund for layouts med en container-boks (pt. "masked"). Token-baseret
 * surface-klasse (globals section D) så den er adaptiv/contrast-sikker pr.
 * sektions-tema — ikke en hardcodet farve.
 */
type PhoneSurface =
  | "neutral"
  | "primary"
  | "secondary"
  | "light"
  | "dark"
  | "none";
type PhoneFill = "gradient" | "solid";

const SURFACE_CLASS: Record<PhoneFill, Record<PhoneSurface, string>> = {
  solid: {
    neutral: "theme-surface-neutral",
    primary: "theme-surface-primary",
    secondary: "theme-surface-secondary",
    light: "theme-surface-light",
    dark: "theme-surface-dark",
    none: "",
  },
  gradient: {
    neutral: "theme-surface-neutral-gradient",
    primary: "theme-surface-primary-gradient",
    secondary: "theme-surface-secondary-gradient",
    light: "theme-surface-light-gradient",
    dark: "theme-surface-dark-gradient",
    none: "",
  },
};

export type EviPhoneCarouselProps = {
  /** Screenshots — ét mockup pr. billede. Tomme felter skippes. */
  fields: ImageField[];
  /** Desktop-komposition. @default "row" */
  layout?: PhoneLayout;
  /** Boks-baggrund for layouts med container (masked). @default "neutral" */
  surface?: PhoneSurface;
  /** Solid eller gradient fill af boks-baggrunden. @default "gradient" */
  fill?: PhoneFill;
  /** Eager-load billederne (above-the-fold) så de ikke flasher tomme. */
  eager?: boolean;
  /**
   * Preload det ene LCP-billede (hero med ét billede). Anvendes kun når der
   * reelt er ét billede — flere billeder skal ikke preloades (doc). @default false.
   */
  preload?: boolean;
  className?: string;
};

const OVERLAP: Partial<Record<PhoneLayout, number>> = {
  fan: 0.31,
  "fan-top": 0.089,
  masked: 0.178,
};

/**
 * Kompositionens totale bredde i "telefon-bredder" (footprint / phoneWidth),
 * INKL. overlap OG rotations-bounding (en roteret ramme fylder bredere end
 * sin egen bredde; origin-top svinger bunden yderligere ud). Bruges til at
 * vælge phone-bredden så footprint ≤ ~90% af containeren — ellers overflow.
 */
function footprint(layout: PhoneLayout, count: number): number {
  const n = count;
  switch (layout) {
    case "row":
      return n + 0.08 * (n - 1);
    case "tilted": // ±6° bounding ≈ 1.21× pr. telefon
      return 1.21 * n + 0.09 * (n - 1);
    case "back-to-back": // rotateY smalner ≈ 0.92× pr. telefon
      return 0.92 * n + 0.067 * (n - 1);
    case "fan": // overlap 0.31 + ±12° yderkant-udsving ~0.4
      return n - 0.31 * (n - 1) + 0.4;
    case "fan-top": // overlap 0.089 + origin-top ±12° bund-udsving ~0.86
      return n - 0.089 * (n - 1) + 0.86;
    case "masked": // clippet (overflow-hidden) — footprint til sizing
      return n - 0.178 * (n - 1) + 1.06;
    case "perspective":
      return 1.05 * n;
    case "floating":
      return 1.12 * n;
  }
}

/**
 * Per-telefon decoration som CSS-vars (--phone-transform / -shift / -origin).
 * globals.css folder dem kun ud når containeren er ≥430px, så en smal
 * kolonne / mobil-carousel står upright.
 */
function phoneStyle(
  layout: PhoneLayout,
  i: number,
  center: number,
): CSSProperties | undefined {
  const offset = i - center;
  const transform: string[] = [];
  const style: Record<string, string | number> = {};

  switch (layout) {
    case "tilted":
      // par: offset ±0.5 → ±6°; trio: ±1 → ±12°
      transform.push(`rotate(${(-offset * 12).toFixed(2)}deg)`);
      break;
    case "fan":
    case "fan-top":
    case "masked": {
      const unit = layout === "masked" ? 15 : 12;
      transform.push(`rotate(${(-offset * unit).toFixed(2)}deg)`);
      if (i > 0)
        style["--phone-shift"] = `calc(var(--evi-phone-w) * -${OVERLAP[layout]})`;
      if (layout !== "fan") style["--phone-origin"] = "top";
      style.zIndex = Math.round(10 - Math.abs(offset)); // center i front
      break;
    }
    case "back-to-back":
      // par: offset ±0.5 → rotateY ±25° (fronts udad)
      transform.push(`rotateY(${(offset * 50).toFixed(2)}deg)`);
      break;
    case "perspective":
      transform.push("rotateY(18deg)");
      break;
    case "floating":
      transform.push("rotate(-3deg) skewY(-2deg)");
      style.filter = "drop-shadow(0 50px 60px rgb(0 0 0 / 0.35))";
      break;
    case "row":
      break;
  }

  if (transform.length) style["--phone-transform"] = transform.join(" ");
  return Object.keys(style).length ? (style as CSSProperties) : undefined;
}

/**
 * Lodret plads (komposition-mode) så roterende frames / skygger ikke dækker
 * teksten over/under. Rotation udvider bounding-boxen lodret; origin-top
 * svinger bunden langt ned; floating har en dyb drop-shadow. Udtrykt som
 * brøkdel af phone-bredden (skalerer med kompositionen), floating i fast px
 * fordi skyggen er fast. masked er clippet (egen h + overflow-hidden).
 */
const PAD_Y: Record<PhoneLayout, string> = {
  row: "",
  tilted: "@[430px]/phones:py-[calc(var(--evi-phone-w)*0.06)]",
  "back-to-back": "@[430px]/phones:py-[calc(var(--evi-phone-w)*0.02)]",
  fan: "@[430px]/phones:py-[calc(var(--evi-phone-w)*0.1)]",
  "fan-top":
    "@[430px]/phones:pt-[calc(var(--evi-phone-w)*0.04)] @[430px]/phones:pb-[calc(var(--evi-phone-w)*0.45)]",
  perspective: "",
  floating: "@[430px]/phones:pt-4 @[430px]/phones:pb-28",
  masked: "",
};

/**
 * Reusable phone-showcase til slices. Bygger på EviPhoneMockup og deler
 * dens fluid-skalering (bredde via --evi-phone-w).
 *
 * CONTAINER-drevet: fylder sin forælder (w-full) og skalerer + skifter
 * layout efter SIN EGEN bredde (@container/phones). Ligger derfor lige så
 * godt i en EviSplit-kolonne (ved siden af tekst) som i en fuld-bredde slot.
 *
 * Smal container (< 430px): ~1.6 telefon synlig i en snap-carousel — den
 * halvt-synlige nabo hinter scroll. ≥430px folder `layout` sin komposition
 * ud. Alle højder capper ved ~65dvh via en dvh-term i bredden (aspect ratio
 * holdes, ingen letterbox). Scroll-affordance + transforms i globals.css.
 */
export function EviPhoneCarousel({
  fields,
  layout = "row",
  surface = "neutral",
  fill = "gradient",
  eager = false,
  preload = false,
  className,
}: EviPhoneCarouselProps): React.ReactElement | null {
  const images = fields.filter((f) => isFilled.image(f));
  if (images.length === 0) return null;

  const count = images.length;
  // preload kun når der reelt er ÉT billede (utvetydigt LCP) — ellers ville
  // flere billeder konkurrere om at være LCP (doc fraråder).
  const preloadLcp = preload && count === 1;
  const center = (count - 1) / 2;
  const single = count === 1;
  const perspective = layout === "back-to-back" || layout === "perspective";

  // Composition-fit (≥430px container): phone-bredden = andel af container så
  // hele footprint'et (inkl. rotation) fylder ≤90cqw → skalerer ned uden
  // overflow. Stadig capped ved 360px + ~65dvh (min inde i --pw-desktop).
  const fitFactor = Math.min(
    100,
    Math.max(20, Math.floor(90 / footprint(layout, count))),
  );

  const gapClass =
    layout === "row"
      ? "@[430px]/phones:gap-[calc(var(--evi-phone-w)*0.08)]"
      : layout === "tilted"
        ? "@[430px]/phones:gap-[calc(var(--evi-phone-w)*0.09)]"
        : layout === "back-to-back"
          ? "@[430px]/phones:gap-[calc(var(--evi-phone-w)*0.067)]"
          : "@[430px]/phones:gap-0";

  return (
    <div
      data-slot="evi-phone-carousel"
      data-layout={layout}
      className={cn("col-span-12 w-full @container/phones", className)}
      style={
        {
          "--pw-mobile": single
            ? "min(22.5rem,80cqw,31.6dvh)"
            : "min(22.5rem,60cqw,31.6dvh)",
          "--pw-desktop": `min(22.5rem,${fitFactor}cqw,31.6dvh)`,
        } as CSSProperties
      }
    >
      <div
        data-slot="evi-phone-track"
        data-layout={layout}
        className={cn(
          "flex w-full gap-4 py-4",
          single
            ? "justify-center @[430px]/phones:py-0"
            : "snap-x snap-mandatory overflow-x-auto scroll-p-6 px-6 @[430px]/phones:snap-none @[430px]/phones:justify-center @[430px]/phones:overflow-visible @[430px]/phones:scroll-p-0 @[430px]/phones:px-0 @[430px]/phones:py-0",
          gapClass,
          perspective && "@[430px]/phones:perspective-[1400px]",
          layout === "masked" &&
            cn(
              "rounded-evi @[430px]/phones:h-[calc(var(--evi-phone-w)*1.39)] @[430px]/phones:items-start @[430px]/phones:overflow-hidden @[430px]/phones:pt-[calc(var(--evi-phone-w)*0.178)]",
              SURFACE_CLASS[fill][surface],
            ),
          PAD_Y[layout],
        )}
      >
        {images.map((field, i) => (
          <EviPhoneMockup
            key={i}
            field={field}
            eager={eager}
            preload={preloadLcp}
            // mx-0 slår EviPhoneMockups base-mx-auto fra: på et flex-item
            // opsluger auto-margins al fri plads og skubber telefonerne fra
            // hinanden (overskriver justify-center/gap/overlap).
            className="mx-0 shrink-0 snap-center"
            style={phoneStyle(layout, i, center)}
          />
        ))}
      </div>
    </div>
  );
}
