import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

interface EviSectionProps {
  theme?: string;
  hero?: boolean;
  collapsePadding?: boolean;
  collapseGapY?: boolean;
  children: ReactNode;
  className?: string;
}

export function EviSection({
  theme = "light",
  hero = false,
  collapsePadding = false,
  collapseGapY = false,
  children,
  className,
}: EviSectionProps) {
  const pb = hero ? "pb-20 md:pb-32" : "pb-16 md:pb-24";
  const pt = collapsePadding
    ? "pt-0"
    : hero
      ? "pt-20 md:pt-32"
      : "pt-16 md:pt-24";

  // Standard gap-y er stor (12/16) så blokke visuelt adskilles som
  // selvstændige enheder. collapseGapY matcher gap-y til gap-x, hvilket
  // giver layouts som 3-kol blok-grid'en et sammenhængende "gitter"-look.
  const gapY = collapseGapY ? "gap-y-4 md:gap-y-8" : "gap-y-12 md:gap-y-16";

  return (
    <section className={twMerge(clsx(`theme-${theme}`, pb, pt), className)}>
      <div
        className={`isolate mx-auto grid max-w-evi grid-cols-12 gap-x-4 ${gapY} px-4 md:gap-x-8 @container/section`}
      >
        {children}
      </div>
    </section>
  );
}
