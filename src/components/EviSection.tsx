import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

interface EviSectionProps {
  theme?: string;
  hero?: boolean;
  collapsePadding?: boolean;
  children: ReactNode;
  className?: string;
}

export function EviSection({
  theme = "light",
  hero = false,
  collapsePadding = false,
  children,
  className,
}: EviSectionProps) {
  const pb = hero ? "pb-20 md:pb-32" : "pb-16 md:pb-24";
  const pt = collapsePadding
    ? "pt-0"
    : hero
      ? "pt-20 md:pt-32"
      : "pt-16 md:pt-24";

  return (
    <section
      className={twMerge(clsx(`theme-${theme}`, pb, pt), className)}
    >
      <div className="isolate mx-auto grid max-w-7xl grid-cols-12 gap-x-4 gap-y-12 px-4 md:gap-x-8 md:gap-y-16 @container/section">
        {children}
      </div>
    </section>
  );
}
