import { EviStack } from "@/src/components/layout/EviStack";
import { cn } from "@/src/lib/utils/cn";

export const PLANIO_ENERGY_SEGMENTS = 10;

type BarSize = "sm" | "md" | "lg";

const sizeClass: Record<BarSize, string> = {
  sm: "h-2 rounded-xs",
  md: "h-3.5 rounded-sm",
  lg: "h-5 rounded-md",
};

/** Energi i procent → antal hele felter (et felt = 10%), 0–10. */
export function energy_segments(percent: number): number {
  return Math.min(
    Math.max(Math.floor(percent / 10), 0),
    PLANIO_ENERGY_SEGMENTS,
  );
}

export type PlanioEnergyBarProps = {
  /** Fyldte felter. */
  filled: number;
  /** Brugte (grå) felter efter de fyldte. @default 0 */
  used?: number;
  /** "sm" = mini i kort, "md" = appskærmen, "lg" = demoens batteri. @default "md" */
  size?: BarSize;
  className?: string;
};

/**
 * Appens energibjælke: 10 felter, fyldt → brugt → fri (stiplet). Dekorativ;
 * tallet står altid i teksten ved siden af.
 */
export function PlanioEnergyBar({
  filled,
  used = 0,
  size = "md",
  className,
}: PlanioEnergyBarProps): React.ReactElement {
  return (
    <EviStack direction="row" gap="xs" aria-hidden className={className}>
      {Array.from({ length: PLANIO_ENERGY_SEGMENTS }, (_, i) => (
        <span
          key={i}
          className={cn(
            "flex-1 transition-colors duration-250",
            sizeClass[size],
            i < filled && "bg-evi-primary",
            i >= filled && i < filled + used && "bg-evi-dark/15",
            i >= filled + used && "border border-dashed border-evi-dark/30",
          )}
        />
      ))}
    </EviStack>
  );
}
