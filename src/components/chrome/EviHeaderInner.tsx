import { cn } from "@/src/lib/utils/cn";

export type EviHeaderInnerProps = Omit<
  React.ComponentProps<"div">,
  "children"
> & {
  /** Venstre zone — typisk brand/logo. Flugter til venstre kant. */
  left: React.ReactNode;
  /** Midterzone — centreret i headeren (fx nav-links). Valgfri. */
  center?: React.ReactNode;
  /** Højre zone — typisk sprog + CTA + mobil-hamburger. Flugter til højre. Valgfri. */
  right?: React.ReactNode;
};

/**
 * Inner content wrapper for header slices: et 3-zone grid (venstre | center |
 * højre). Sidezonerne er lige brede (1fr), så midterzonen centreres i headeren
 * UANSET logo-/action-bredder — mens venstre og højre flugter til hver sin kant.
 * Midterzonen er `auto` (fylder sit indhold), så et tomt center (fx på mobil hvor
 * nav'en er skjult) kollapser til 0 og headeren bliver logo-venstre / actions-højre.
 *
 * Giver desuden `max-w-evi` + responsiv padding. Chrome-primitiv (Tailwind
 * tilladt, R3.3) — slice-filer komponerer `<EviHeaderShell><EviHeaderInner .../>`
 * og skriver aldrig grid/max-w/padding selv.
 */
export function EviHeaderInner({
  left,
  center,
  right,
  className,
  ...props
}: EviHeaderInnerProps): React.ReactElement {
  return (
    <div
      data-slot="evi-header-inner"
      className={cn(
        "mx-auto grid max-w-evi grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3",
        className,
      )}
      {...props}
    >
      <div className="flex justify-start">{left}</div>
      <div className="flex justify-center">{center}</div>
      <div className="flex justify-end">{right}</div>
    </div>
  );
}
