import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

interface EviAutoGridProps {
  size: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
}

// Pre-calculated breakpoints: minWidth × cols + 32px × (cols - 1)
// sm (250px): 2→532  3→814  4→1096  6→1660
// md (320px): 2→672  3→1024  4→1376
// lg (400px): 2→832  3→1264
const sizeClasses: Record<"sm" | "md" | "lg", string> = {
  sm: "grid-cols-1 @[532px]/grid:grid-cols-2 @[814px]/grid:grid-cols-3 @[1096px]/grid:grid-cols-4 @[1660px]/grid:grid-cols-6",
  md: "grid-cols-1 @[672px]/grid:grid-cols-2 @[1024px]/grid:grid-cols-3 @[1376px]/grid:grid-cols-4",
  lg: "grid-cols-1 @[832px]/grid:grid-cols-2 @[1264px]/grid:grid-cols-3",
};

export function EviAutoGrid({
  size,
  children,
  className,
}: EviAutoGridProps) {
  return (
    <div className="col-span-12 @container/grid">
      <div
        className={twMerge(
          clsx(
            "grid gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12",
            sizeClasses[size],
          ),
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
