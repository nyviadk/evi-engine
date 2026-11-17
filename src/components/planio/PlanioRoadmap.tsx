import { EviCard } from "@/src/components/ui/EviCard";
import { PlanioStar } from "@/src/components/planio/PlanioStar";
import { cn } from "@/src/lib/utils/cn";

/**
 * My Planios køreplan: trin på en stiplet linje. Smal: trinene under hinanden med
 * stjernen til venstre. Fra lg: ét trin pr. kolonne over fire fælles rækker
 * (stjerne, mærkat, titel, tekst), så trinene som EviCard-subgrids flugter på
 * tværs af kolonnerne. Rå grid frem for EviAutoGrid: én kolonne pr. trin
 * (grid-flow-col over fire faste rækker), og linjen skifter retning med layoutet.
 */
function Root({
  className,
  ...props
}: React.ComponentProps<"ol">): React.ReactElement {
  return (
    <ol
      data-slot="planio-roadmap"
      className={cn(
        "relative col-span-12 grid gap-8 lg:auto-cols-fr lg:grid-flow-col lg:grid-rows-[repeat(4,auto)]",
        // Linjen går gennem stjernernes midte (stjernen er 2rem).
        "before:absolute before:inset-y-4 before:left-[calc(1rem-0.75px)] before:border-l-[1.5px] before:border-dashed before:border-current/30",
        "lg:before:inset-x-4 lg:before:top-[calc(1rem-0.75px)] lg:before:bottom-auto lg:before:border-t-[1.5px] lg:before:border-l-0",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Ét trin: et EviCard over fire rækker, fyldt i rækkefølgen stjerne, mærkat,
 * titel, tekst (tomme felter som `<div />`). Smal: stjernen i en egen kolonne ved
 * siden af de tre andre, så kortet kun spænder over tre rækker; en tom fjerde
 * række gav 16px ekstra luft mellem trinene.
 */
function Step({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <EviCard
      as="li"
      rows={4}
      className="grid-cols-[2rem_minmax(0,1fr)] gap-x-4 max-lg:row-span-3 lg:grid-cols-1"
    >
      {children}
    </EviCard>
  );
}

/**
 * Stjernen på linjen: fyldt for det, appen kan i dag, kontur for det, der
 * kommer. Sektionens baggrund bag den skærer linjen over.
 */
function Marker({ current = false }: { current?: boolean }): React.ReactElement {
  return (
    <span aria-hidden className="row-span-3 size-8 self-start bg-(--theme-bg) lg:row-span-1">
      <PlanioStar
        variant={current ? "filled" : "outline"}
        className={cn("size-8", current && "text-evi-primary")}
      />
    </span>
  );
}

export const PlanioRoadmap = Object.assign(Root, { Step, Marker });
