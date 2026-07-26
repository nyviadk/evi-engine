import { cn } from "@/src/lib/utils/cn";

/**
 * EviDivider — en tynd vandret adskiller. Native `<hr>` (implicit
 * `role="separator"` → gratis a11y), farvet med `current`-tokenet så den følger
 * sektionens/kortets tema (læsbar på lys, mørk og tonede flader). Genbrugbar på
 * tværs af kort, lister, sektioner.
 */
export function EviDivider({
  className,
  ...props
}: React.ComponentProps<"hr">): React.ReactElement {
  return (
    <hr
      data-slot="evi-divider"
      className={cn("border-0 border-t border-current/10", className)}
      {...props}
    />
  );
}
