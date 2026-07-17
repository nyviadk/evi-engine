import { isFilled, type ImageField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { cn } from "@/src/lib/utils/cn";
import { lqip_url } from "@/src/lib/utils/imgix";

export type EviPhoneMockupProps = Omit<
  React.ComponentProps<"div">,
  "children"
> & {
  field: ImageField;
  /**
   * Eager-load billedet (above-the-fold) via loading="eager", så rammen ikke
   * flasher tom før billedet loader. Next 16: `priority` er deprecated, og
   * doc'en anbefaler loading="eager" frem for `preload` i de fleste tilfælde.
   * @default false (lazy).
   */
  eager?: boolean;
  /**
   * Preload via <link> i <head> (Next `preload`) — KUN til det ene LCP-billede
   * (hero med ét billede). Doc fraråder det ved flere mulige LCP-billeder og
   * sammen med `loading`. Vinder over `eager` (loading droppes da de ikke må
   * kombineres). @default false.
   */
  preload?: boolean;
};

/**
 * iPhone-inspireret ramme til app-screenshots. Aspect-baseret så alt
 * skalerer med container. Farver via evi-tokens. Positioner + størrelser
 * i % så interne proportioner holder ved scaling; radius + bezel er
 * brøkdel af bredden (48/36/12 px @ 360px, alle ÷4) så de skalerer fluid.
 * Indre radius = ydre − bezel (48−12=36) → koncentriske hjørner.
 *
 * Bredde via --evi-phone-w så grupper kan sætte én fluid værdi (fx
 * min(22.5rem,32cqw)) og udtrykke deres margins som brøkdel af den —
 * så hele kompositionen nedskalerer 1-1 uden overflow. Default caps ved
 * 360px og krymper til container på smalle skærme.
 *
 * NB: [data-slot="evi-phone-mockup"] i globals.css opt'er ud af global
 * corner-shape:squircle reset — ellers ser 48px klumpet ud og kamera
 * bliver squircle-firkant i stedet for cirkel.
 */
export function EviPhoneMockup({
  field,
  className,
  eager = false,
  preload = false,
  ...rest
}: EviPhoneMockupProps): React.ReactElement | null {
  if (!isFilled.image(field)) return null;

  const blurUrl = lqip_url(field.url);

  return (
    <div
      {...rest}
      data-slot="evi-phone-mockup"
      className={cn(
        // --pw: telefonens faktiske bredde. --frame-r/--frame-p = ydre radius
        // (48px @ 360) og bezel (12px @ 360) som brøkdel af bredden, så alt
        // skalerer fluid. Indre skærm-radius = ydre − bezel (koncentrisk
        // nested-radius-regel), så hjørnerne følger samme bue ved enhver skala.
        "relative mx-auto aspect-18/37 [--pw:var(--evi-phone-w,min(22.5rem,100%))] [--frame-r:calc(var(--pw)/7.5)] [--frame-p:calc(var(--pw)/30)] w-(--pw)",
        "rounded-(--frame-r) bg-evi-dark p-(--frame-p)",
        "shadow-evi-lg border border-evi-light/20",
        className,
      )}
    >
      {/* Dynamic Island — 110×30 → 30.55%×4.05%, top 22 → 2.97% */}
      <div
        aria-hidden
        className="absolute top-[2.97%] left-1/2 z-10 flex h-[4.05%] w-[30.55%] -translate-x-1/2 items-center justify-between rounded-full bg-evi-dark px-[4.16%]"
      >
        {/* Speaker */}
        <div className="h-[13.33%] w-[36.36%] shrink-0 rounded-full bg-evi-light/20" />
        {/* Kamera — subtile primary tint, matches reference #0d1b2a/#1b263b look */}
        <div className="box-content aspect-square h-[33.33%] shrink-0 rounded-full border-2 border-evi-primary/20 bg-evi-primary/15" />
      </div>

      {/* Volume up — top 140 → 18.92%, height 50 → 6.76% */}
      <div
        aria-hidden
        className="absolute top-[18.92%] left-[-1.11%] h-[6.76%] w-[1.11%] rounded-l-full bg-evi-dark"
      />
      {/* Volume down — top 200 → 27.03% */}
      <div
        aria-hidden
        className="absolute top-[27.03%] left-[-1.11%] h-[6.76%] w-[1.11%] rounded-l-full bg-evi-dark"
      />
      {/* Power — top 160 → 21.62%, height 65 → 8.78% */}
      <div
        aria-hidden
        className="absolute top-[21.62%] right-[-1.11%] h-[8.78%] w-[1.11%] rounded-r-full bg-evi-dark"
      />

      {/* Skærm — isolate opretter stacking context så Next Image respekterer
          parent's overflow-hidden clip på rounded corners. bg-evi-dark er
          fallback bag LQIP-bluren (vises til billedet er malet); billedet
          ligger ovenpå og dækker bluren når det er loadet. */}
      <div
        className="relative isolate size-full overflow-hidden rounded-[calc(var(--frame-r)-var(--frame-p))] border border-evi-light/10 bg-evi-dark bg-cover bg-center"
        style={blurUrl ? { backgroundImage: `url("${blurUrl}")` } : undefined}
      >
        <PrismicNextImage
          field={field}
          fill
          // Uden sizes antager Next 100vw og henter et kæmpe billede. Mockup
          // er max ~360px (capped) og ~75vw på mobil → hent en lille variant.
          sizes="(min-width: 430px) 360px, 75vw"
          // preload (LCP) og loading må ikke kombineres → vælg én.
          {...(preload
            ? { preload: true }
            : { loading: (eager ? "eager" : "lazy") as "eager" | "lazy" })}
          className="object-cover select-none"
          fallbackAlt=""
        />
      </div>
    </div>
  );
}
