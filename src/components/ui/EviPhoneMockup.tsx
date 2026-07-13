import { isFilled, type ImageField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { cn } from "@/src/lib/utils/cn";

export type EviPhoneMockupProps = Omit<
  React.ComponentProps<"div">,
  "children"
> & {
  field: ImageField;
};

/**
 * iPhone-inspireret ramme til app-screenshots. Aspect-baseret så alt
 * skalerer med container. Farver via evi-tokens. Positioner + størrelser
 * i % så interne proportioner holder ved scaling; radius + bezel er
 * brøkdel af bredden (48/38/12 px @ 360px) så de også skalerer fluid.
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
  ...rest
}: EviPhoneMockupProps): React.ReactElement | null {
  if (!isFilled.image(field)) return null;

  return (
    <div
      {...rest}
      data-slot="evi-phone-mockup"
      className={cn(
        // --pw: telefonens faktiske bredde. Radius + bezel udtrykkes som
        // brøkdel af den, så alt skalerer fluid (48/38/12 px @ 360px design).
        "relative mx-auto aspect-18/37 [--pw:var(--evi-phone-w,min(22.5rem,100%))] w-(--pw)",
        "rounded-[calc(var(--pw)*0.133)] bg-evi-dark p-[calc(var(--pw)*0.033)]",
        "shadow-2xl ring-1 ring-evi-light/20 ring-inset",
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
          parent's overflow-hidden clip på rounded corners */}
      <div className="relative isolate size-full overflow-hidden rounded-[calc(var(--pw)*0.105)] border border-evi-light/10">
        <PrismicNextImage
          field={field}
          fill
          className="object-cover"
          fallbackAlt=""
        />
      </div>
    </div>
  );
}
