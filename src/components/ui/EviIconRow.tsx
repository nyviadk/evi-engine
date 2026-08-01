import { EviIconBadge, type EviIconBadgeProps } from "@/src/components/ui/EviIconBadge";
import { cn } from "@/src/lib/utils/cn";

export type EviIconRowProps = {
  /** Iconify-navn til badgen. Tomt → badgen rendrer intet (badge-guard). */
  icon?: string | null;
  /** Badge-størrelse. @default "sm" */
  iconSize?: EviIconBadgeProps["size"];
  /** Tekst-blokken ved siden af (bred) / under (smal) ikonet. */
  children: React.ReactNode;
  /** Ekstra klasser på ydre wrapper (fx spacing). */
  className?: string;
};

/**
 * Ikon-badge + tekst side om side — men stakket (ikon OVER tekst) når rækkens
 * EGEN bredde falder under ~18rem. Container-query'en måler den faktiske rådige
 * bredde (ikke viewport), så det virker uanset om rækken sidder i én bred kolonne
 * (highlights-boks) eller en smal grid-celle (features-split "to kolonner").
 * `min-w-0` lader tekst-blokken krympe under sit længste ord i række-tilstand.
 */
export function EviIconRow({
  icon,
  iconSize,
  children,
  className,
}: EviIconRowProps): React.ReactElement {
  return (
    <div
      data-slot="evi-icon-row"
      className={cn("@container/icon-row", className)}
    >
      <div className="flex flex-col items-start gap-3 @[18rem]/icon-row:flex-row">
        <EviIconBadge name={icon} size={iconSize} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
