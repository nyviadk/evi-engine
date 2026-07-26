import { Children } from "react";
import { cn } from "@/src/lib/utils/cn";

export type EviCardRows = 2 | 3 | 4 | 5 | 6 | 7;

export type EviCardProps = React.ComponentProps<"div"> & {
  /** Antal subgrid-rækker. Skal matche antallet af direkte børn — tomme slots wrappes i `<div />`. */
  rows: EviCardRows;
};

/** Literale row-span-klasser (Tailwind scanner kun statiske strenge). Deles med
 *  EviSplit's `rows`, så pane-wrapper og kort spænder over de samme spor. */
export const EVI_ROW_SPAN: Record<EviCardRows, string> = {
  2: "row-span-2",
  3: "row-span-3",
  4: "row-span-4",
  5: "row-span-5",
  6: "row-span-6",
  7: "row-span-7",
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
        EVI_ROW_SPAN[rows],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
