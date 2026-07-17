import { isFilled } from "@prismicio/client";

import { EviIcon } from "@/src/components/ui/EviIcon";
import { cn } from "@/src/lib/utils/cn";
import { resolve_surface_contrast } from "@/src/lib/utils/surface";

type BadgeSize = "sm" | "md";
type BadgeTone = "solid" | "surface";

const sizeClass: Record<BadgeSize, { box: string; icon: string }> = {
  sm: { box: "p-2", icon: "size-5" },
  md: { box: "p-3", icon: "size-6" },
};

export type EviIconBadgeProps = {
  /** Iconify-navn fra Prismic. Tomt → intet render (caller slipper for guard). */
  name?: string | null;
  /** "sm" = kompakte lister (p-2 / ikon size-5). "md" = kort (p-3 / size-6). @default "sm" */
  size?: BadgeSize;
  /**
   * "solid" — sekundær brand-flade + kontrast-ikon.
   * "surface" — kontrast-flade ift. `on` + primær-ikon. Bruges på kort hvor
   * kunden selv vælger flade-farve, så badgen ikke smelter sammen med kortet.
   * @default "solid"
   */
  tone?: BadgeTone;
  /** Prismic farve-label på fladen badgen LIGGER PÅ. Kun brugt ved `tone="surface"`. */
  on?: string | null;
  className?: string;
};

/**
 * EviIconBadge — den runde ikon-badge. Samler mønsteret der før var kopieret i
 * features/cards, features/split og highlights.
 *
 * NB: `rounded-full` giver en ægte cirkel takket være opt-out'et fra squircle-
 * reset'et i globals.css (ellers renderes den som en superellipse).
 */
export function EviIconBadge({
  name,
  size = "sm",
  tone = "solid",
  on,
  className,
}: EviIconBadgeProps): React.ReactElement | null {
  if (!isFilled.keyText(name)) return null;

  const { box, icon } = sizeClass[size];
  const surfaceClass =
    tone === "surface" ? resolve_surface_contrast(on) : "bg-evi-secondary";
  const iconColor =
    tone === "surface" ? "text-evi-primary" : "text-evi-text-on-secondary";

  return (
    <span
      data-slot="evi-icon-badge"
      data-tone={tone}
      className={cn(
        "inline-flex w-fit shrink-0 rounded-full",
        box,
        surfaceClass,
        className,
      )}
    >
      <EviIcon name={name} className={cn(icon, iconColor)} />
    </span>
  );
}
