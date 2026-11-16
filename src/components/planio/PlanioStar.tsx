import { cn } from "@/src/lib/utils/cn";

const POINTS =
  "50,0 60.5,31.8 93.3,25 71,50 93.3,75 60.5,68.2 50,100 39.5,68.2 6.7,75 29,50 6.7,25 39.5,31.8";

export type PlanioStarProps = {
  /** "filled" = fyldt mærke, "outline" = streg (fx ved "Fremtidig funktion"). @default "filled" */
  variant?: "filled" | "outline";
  className?: string;
};

/** My Planios stjerne. Dekorativ; farven følger currentColor. */
export function PlanioStar({
  variant = "filled",
  className,
}: PlanioStarProps): React.ReactElement {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className={cn("size-6 shrink-0 overflow-visible", className)}
    >
      {variant === "filled" ? (
        <polygon points={POINTS} fill="currentColor" />
      ) : (
        <polygon
          points={POINTS}
          fill="none"
          stroke="currentColor"
          strokeWidth={8}
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
