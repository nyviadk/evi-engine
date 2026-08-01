"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";

import { EviStack } from "@/src/components/layout/EviStack";
import { cn } from "@/src/lib/utils/cn";

export type EviCarouselProps = {
  /** Server-rendrede slides (hele indholdet). Kun ét vises ad gangen. */
  slides: ReactNode[];
  /** Pil-glyf (server-rendret, fx EviIcon) til "næste"; "forrige" spejlvendes. */
  icon: ReactNode;
  /** aria-label på regionen (sprog-korrekt, fx sektionens overskrift). */
  label?: string;
  /** aria-labels til pilene — sendes ind (sprog-korrekt), aldrig hardcodet. */
  prevLabel: string;
  nextLabel: string;
  /** aria-label pr. dot (fx afsender). Mangler et → falder tilbage til nummeret. */
  dotLabels?: string[];
  className?: string;
};

const ARROW_BTN =
  "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-current/25 transition-colors hover:border-current/50 focus-visible:outline-2 focus-visible:outline-offset-2";

/**
 * EviCarousel — genbrugbar enkelt-slide-carousel: ét slide ad gangen, pile + dots
 * + pil-taster (venstre/højre, når en kontrol har fokus). Al tung rendering sker
 * på serveren og sendes ind som `slides`/`icon` (jf. EviReveal) — kun index-state
 * lever på klienten.
 *
 * Fast højde: alle slides ligger i SAMME grid-celle, så containeren er lige så høj
 * som det højeste slide → layoutet hopper ikke mellem lange/korte slides; kortere
 * indhold centreres lodret og får ekstra luft.
 */
export function EviCarousel({
  slides,
  icon,
  label,
  prevLabel,
  nextLabel,
  dotLabels,
  className,
}: EviCarouselProps): React.ReactElement | null {
  const [active, setActive] = useState(0);
  const count = slides.length;
  if (count === 0) return null;

  const go = (i: number): void => setActive((i + count) % count);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>): void => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(active - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(active + 1);
    }
  };

  return (
    <div
      data-slot="evi-carousel"
      role="group"
      aria-label={label}
      className={cn("col-span-12", className)}
    >
      <div className="grid" aria-live="polite">
        {slides.map((slide, i) => (
          <div
            key={i}
            aria-hidden={i !== active}
            inert={i !== active || undefined}
            className={cn(
              // Sekventiel fade: udgående forsvinder straks (200ms), indgående
              // venter (delay-200) og fader så ind → aldrig to synlige på én gang.
              "col-start-1 row-start-1 flex flex-col justify-center transition-opacity duration-200",
              i === active
                ? "opacity-100 delay-200"
                : "pointer-events-none opacity-0",
            )}
          >
            {slide}
          </div>
        ))}
      </div>

      {count > 1 && (
        <EviStack
          direction="row"
          align="center"
          justify="center"
          gap="md"
          className="mt-8"
        >
          <button
            type="button"
            onClick={() => go(active - 1)}
            onKeyDown={onKeyDown}
            aria-label={prevLabel}
            className={ARROW_BTN}
          >
            <span className="-scale-x-100">{icon}</span>
          </button>

          <EviStack direction="row" align="center" gap="sm">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                onKeyDown={onKeyDown}
                aria-label={dotLabels?.[i] || String(i + 1)}
                aria-current={i === active}
                className={cn(
                  "size-2 cursor-pointer rounded-full transition-colors",
                  i === active
                    ? "bg-current"
                    : "bg-current/25 hover:bg-current/50",
                )}
              />
            ))}
          </EviStack>

          <button
            type="button"
            onClick={() => go(active + 1)}
            onKeyDown={onKeyDown}
            aria-label={nextLabel}
            className={ARROW_BTN}
          >
            {icon}
          </button>
        </EviStack>
      )}
    </div>
  );
}
