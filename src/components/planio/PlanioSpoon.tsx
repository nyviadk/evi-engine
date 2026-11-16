import { cn } from "@/src/lib/utils/cn";

/**
 * En ske til energi-enheden "Skeer" (ske-teorien). Ingen af de installerede
 * ikonpakker har en ske, og MDI er for tung til Worker-bundtet. Dekorativ;
 * farven følger currentColor.
 */
export function PlanioSpoon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-5 shrink-0", className)}
    >
      <ellipse cx="12" cy="7.5" rx="5" ry="6.5" />
      <path d="M10.9 13.4 Q12 14 13.1 13.4 L13.7 21.6 A1.7 1.7 0 0 1 10.3 21.6 Z" />
    </svg>
  );
}
