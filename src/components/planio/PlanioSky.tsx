import { cn } from "@/src/lib/utils/cn";

export type PlanioSkyStar = {
  /** Placering (og evt. forsinket indtoning) som literal Tailwind-klasser. */
  position: string;
  /** Større og lysere stjerne. */
  big?: boolean;
  /** Kun fra md, så små skærme ikke bliver overfyldte. */
  wide?: boolean;
};

/**
 * My Planios stjernehimmel: små lyse prikker, der toner ind. Dekorativ og absolut
 * placeret, så sektionen den ligger i skal have `relative overflow-hidden`.
 */
export function PlanioSky({
  stars,
}: {
  stars: readonly PlanioSkyStar[];
}): React.ReactElement {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {stars.map((star) => (
        <span
          key={star.position}
          className={cn(
            "absolute rounded-full bg-evi-light transition-opacity duration-1200 ease-out starting:opacity-0 motion-reduce:delay-0",
            star.big ? "size-0.75 opacity-80" : "size-0.5 opacity-60",
            star.wide && "max-md:hidden",
            star.position,
          )}
        />
      ))}
    </div>
  );
}
