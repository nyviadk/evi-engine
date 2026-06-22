import { Children } from "react";
import { cn } from "@/src/lib/utils/cn";

type CardRows = 2 | 3 | 4 | 5 | 6;

export type EviCardProps = React.ComponentProps<"div"> & {
  /** Antal subgrid-rækker. Skal matche antallet af direkte børn — tomme slots wrappes i `<div />`. */
  rows: CardRows;
};

const rowClasses: Record<CardRows, string> = {
  2: "row-span-2",
  3: "row-span-3",
  4: "row-span-4",
  5: "row-span-5",
  6: "row-span-6",
};

export function EviCard({
  rows,
  className,
  children,
  ...props
}: EviCardProps): React.ReactElement {
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
      data-slot="evi-card"
      data-rows={rows}
      className={cn(
        "relative isolate grid grid-rows-subgrid gap-0",
        rowClasses[rows],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
