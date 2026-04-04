import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

interface EviStackProps {
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  className?: string;
}

const gapClasses = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
} as const;

export function EviStack({ gap = "md", children, className }: EviStackProps) {
  return (
    <div className={twMerge(clsx("flex flex-col", gapClasses[gap]), className)}>
      {children}
    </div>
  );
}
