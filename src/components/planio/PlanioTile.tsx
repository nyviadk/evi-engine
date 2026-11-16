import { cn } from "@/src/lib/utils/cn";

/**
 * Ramme om en flise i "Gør appen til din": neutral flade, der følger sektionens
 * tema (lys tone på mørk), samme padding-skala som EviImage `framed`. Container
 * (`tile`), så indholdet kan rette sig efter flisens bredde.
 */
export function PlanioTile({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      data-slot="planio-tile"
      className={cn(
        "@container/tile theme-surface-neutral flex flex-col justify-center rounded-evi p-4 sm:p-6 md:p-8",
        className,
      )}
      {...props}
    />
  );
}
