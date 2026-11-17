import { PlanioSky, type PlanioSkyStar } from "@/src/components/planio/PlanioSky";
import { cn } from "@/src/lib/utils/cn";

// Stjernerne fra designet: placering + indtoning. `big` er de lysere, `wide`
// vises kun fra md. Designets placeringer gælder fra xl; under det står de
// inderste ude ved kanten, ellers lander de i overskrift og knapper (designets
// header lå inde i heroen og skubbede teksten ned). Mobil: ude ved telefonen.
const STARS: PlanioSkyStar[] = [
  { position: "left-[6%] top-[16%] delay-400", big: true, wide: true },
  { position: "left-[14%] top-[46%] delay-1600", wide: true },
  {
    position:
      "left-[8%] top-[72%] md:left-[11%] md:top-[9%] xl:left-[23%] xl:top-[10%] delay-2100",
  },
  {
    position: "left-[17%] top-[31%] xl:left-[31%] xl:top-[33%] delay-1100",
    wide: true,
  },
  { position: "left-[91%] top-[66%] md:left-[89%] md:top-[7%] delay-1800" },
  {
    position: "left-[82%] top-[37%] xl:left-[79%] xl:top-[38%] delay-2400",
    wide: true,
  },
  {
    position: "left-[93%] top-[19%] xl:left-[87%] xl:top-[18%] delay-900",
    big: true,
    wide: true,
  },
  { position: "left-[94%] top-[44%] delay-1400", wide: true },
];

export type PlanioHeroSectionProps = Omit<
  React.ComponentProps<"section">,
  "children"
> & {
  /** Heroens tekst og knapper (i sitets containerbredde). */
  children: React.ReactNode;
  /** Det der rejser sig over horisonten, fx en telefon. */
  horizon?: React.ReactNode;
  /** Beskrivelse af horisont-indholdet til skærmlæsere. */
  horizonLabel?: string;
};

/**
 * My Planio-hero: mørk nattehimmel med stjerner over en lys horisont-bue, hvor
 * `horizon` rejser sig op af buen. Buen ender i sidens lyse flade, så sektionen
 * under fortsætter direkte fra den.
 *
 * Sektion-primitiv (som EviCoverSection): stjerner, glød og bue går helt ud til
 * kanten, hvilket EviSections indre container ikke kan.
 */
export function PlanioHeroSection({
  children,
  horizon,
  horizonLabel,
  className,
  ...props
}: PlanioHeroSectionProps): React.ReactElement {
  return (
    <section
      data-slot="planio-hero-section"
      className={cn(
        "theme-dark @container relative isolate overflow-hidden pt-8 md:pt-12",
        // Himlen lysner svagt mod horisonten.
        "bg-[radial-gradient(130%_55%_at_50%_100%,color-mix(in_oklab,var(--color-evi-primary)_16%,transparent),transparent_70%)]",
        // --rise = hvor højt horisont-indholdet står over buen. Fra md synker det
        // på lave skærme, så toppen af næste sektion kan ses uden at scrolle.
        "[--horizon-scale:0.8] [--rise:13.75rem] md:[--horizon-scale:1] md:[--rise:clamp(11.25rem,100svh-36rem-8.2cqi,18.75rem)]",
        className,
      )}
      {...props}
    >
      <PlanioSky stars={STARS} />

      <div className="relative mx-auto max-w-evi px-4">{children}</div>

      <figure
        aria-label={horizonLabel}
        aria-hidden={horizonLabel ? undefined : true}
        className="relative mt-12 h-[calc(var(--rise)+8.2cqi)] md:mt-16"
      >
        <div
          aria-hidden
          className="absolute top-10 left-1/2 h-140 w-[min(1000px,160cqi)] -translate-x-1/2 bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-evi-primary)_26%,transparent),color-mix(in_oklab,var(--color-evi-primary)_8%,transparent)_55%,transparent)]"
        />
        {horizon && (
          <div
            aria-hidden
            className="absolute top-0 left-1/2 origin-top -translate-x-1/2 scale-(--horizon-scale) [--evi-phone-w:18.75rem]"
          >
            {/* motion-reduce:delay-0: den globale reduced-motion-regel nulstiller
                kun varigheden, så uden den ville indholdet poppe ind forsinket. */}
            <div className="transition-[opacity,translate] delay-200 duration-1400 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:delay-0 starting:translate-y-12 starting:opacity-0">
              {horizon}
            </div>
          </div>
        )}
        {/* Buen er en ellipse (160% bred, 2,2:1), så formen er ens på alle
            bredder; dybden er ~8,2% af bredden, som figurens højde lægger til.
            corner-shape: round, ellers gør det globale squircle-reset den kantet. */}
        <div
          aria-hidden
          className="absolute top-(--rise) left-[-30%] aspect-[2.2/1] w-[160%] rounded-[50%] bg-evi-light shadow-[0_-1px_0_color-mix(in_oklab,var(--color-evi-primary)_45%,transparent),0_-10px_40px_color-mix(in_oklab,var(--color-evi-light)_10%,transparent),0_-36px_110px_-10px_color-mix(in_oklab,var(--color-evi-primary)_30%,transparent)] [corner-shape:round]"
        />
      </figure>
    </section>
  );
}
