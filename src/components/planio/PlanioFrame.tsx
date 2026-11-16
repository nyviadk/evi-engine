import { isFilled, type KeyTextField } from "@prismicio/client";

import { cn } from "@/src/lib/utils/cn";

export type PlanioFrameProps = Omit<React.ComponentProps<"div">, "aria-label"> & {
  /**
   * Beskrivelse til skærmlæsere. Udfyldt → hele rammen er ét billede (kortet
   * er en illustration af appen); tom → kortets tekst læses som almindelig tekst.
   */
  label?: KeyTextField;
};

/**
 * Lys primær-scene om et app-kort. Samme padding-skala som EviImage
 * `framed`, men i `theme-primary-soft` som designet.
 */
export function PlanioFrame({
  label,
  className,
  ...props
}: PlanioFrameProps): React.ReactElement {
  const described = isFilled.keyText(label);

  return (
    <div
      data-slot="planio-frame"
      role={described ? "img" : undefined}
      aria-label={described ? label : undefined}
      className={cn(
        "theme-primary-soft flex flex-col items-center justify-center rounded-evi p-4 sm:p-6 md:p-8",
        className,
      )}
      {...props}
    />
  );
}
