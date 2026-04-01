import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

interface EviSectionProps {
  theme?: string;
  collapsePadding?: boolean;
  children: ReactNode;
  className?: string;
}

export function EviSection({
  theme = "light",
  collapsePadding = false,
  children,
  className,
}: EviSectionProps) {
  return (
    <section
      className={twMerge(
        clsx(
          `theme-${theme}`,
          collapsePadding ? "pt-0" : "pt-16 md:pt-24",
        ),
        className,
      )}
    >
      {children}
    </section>
  );
}
