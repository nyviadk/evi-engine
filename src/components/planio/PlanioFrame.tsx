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
 * Lys primær-scene om et app-kort i `theme-primary-soft` som designet.
 * Padding som EviImage `framed`, men p-3 på mobil: skinne, ramme og kort
 * lægger hver deres luft ind, og ved 280px var kortet ellers kun 168px bredt.
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
        "theme-primary-soft flex flex-col items-center justify-center rounded-evi p-3 sm:p-6 md:p-8",
        className,
      )}
      {...props}
    />
  );
}
