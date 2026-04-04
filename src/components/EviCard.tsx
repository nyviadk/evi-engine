import { Children, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

interface EviCardProps {
  rows: 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
}

const rowClasses: Record<2 | 3 | 4 | 5 | 6, string> = {
  2: "row-span-2",
  3: "row-span-3",
  4: "row-span-4",
  5: "row-span-5",
  6: "row-span-6",
};

export function EviCard({ rows, children, className }: EviCardProps) {
  if (process.env.NODE_ENV === "development") {
    const count = Children.count(children);
    if (count !== rows) {
      console.error(
        `[EviCard] Expected ${rows} children but received ${count}. ` +
          `Subgrid row alignment will break. Wrap empty slots in <div />.`,
      );
    }
  }

  return (
    <div
      className={twMerge(
        clsx("isolate grid grid-rows-subgrid gap-0", rowClasses[rows]),
        className,
      )}
    >
      {children}
    </div>
  );
}
