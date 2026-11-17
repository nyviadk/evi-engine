import { isFilled, type KeyTextField } from "@prismicio/client";

import { cn } from "@/src/lib/utils/cn";

export type PlanioFrameProps = Omit<React.ComponentProps<"div">, "aria-label"> & {
  /**
   * "primary" = lys primær-scene om et app-kort, som designet. "neutral" = flade,
   * der følger sektionens tema (lys tone på mørk), til fliserne i "Gør appen til din".
   * @default "primary"
   */
  tone?: "primary" | "neutral";
  /**
   * Beskrivelse til skærmlæsere. Udfyldt → hele rammen er ét billede (kortet
   * er en illustration af appen); tom → kortets tekst læses som almindelig tekst.
   */
  label?: KeyTextField;
};

/**
 * Ramme om et app-kort eller en flise. Padding som EviImage `framed`, men p-3 på
 * mobil: skinne, ramme og kort lægger hver deres luft ind, og ved 280px var kortet
 * ellers kun 168px bredt. Container (`frame`), så indholdet kan rette sig efter
 * rammens bredde.
 */
export function PlanioFrame({
  tone = "primary",
  label,
  className,
  ...props
}: PlanioFrameProps): React.ReactElement {
  const described = isFilled.keyText(label);

  return (
    <div
      data-slot="planio-frame"
      data-tone={tone}
      role={described ? "img" : undefined}
      aria-label={described ? label : undefined}
      className={cn(
        "@container/frame flex flex-col justify-center rounded-evi p-3 sm:p-6 md:p-8",
        tone === "primary" ? "theme-primary-soft" : "theme-surface-neutral",
        className,
      )}
      {...props}
    />
  );
}
