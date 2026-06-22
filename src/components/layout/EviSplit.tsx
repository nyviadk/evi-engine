import { type ReactNode } from "react";
import { cn } from "@/src/lib/utils/cn";

type SplitPreset = "50-50" | "60-40" | "40-60" | "33-67" | "67-33";
type SplitAlign = "start" | "center" | "end" | "stretch";

export type EviSplitProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Forhold mellem venstre og højre pane (på desktop). */
  preset: SplitPreset;
  /** Vertikal alignment af pane-indholdet. @default "stretch" */
  align?: SplitAlign;
  /** Præcis 2 børn: venstre og højre pane. */
  children: [ReactNode, ReactNode];
};

const presetClasses: Record<SplitPreset, { left: string; right: string }> = {
  "50-50": {
    left: "col-span-12 @3xl/section:col-span-6",
    right: "col-span-12 @3xl/section:col-span-6",
  },
  "60-40": {
    left: "col-span-12 @3xl/section:col-span-7",
    right: "col-span-12 @3xl/section:col-span-5",
  },
  "40-60": {
    left: "col-span-12 @3xl/section:col-span-5",
    right: "col-span-12 @3xl/section:col-span-7",
  },
  "33-67": {
    left: "col-span-12 @3xl/section:col-span-4",
    right: "col-span-12 @3xl/section:col-span-8",
  },
  "67-33": {
    left: "col-span-12 @3xl/section:col-span-8",
    right: "col-span-12 @3xl/section:col-span-4",
  },
};

const alignClasses: Record<SplitAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

export function EviSplit({
  preset,
  align = "stretch",
  className,
  children,
  ...props
}: EviSplitProps): React.ReactElement {
  const cols = presetClasses[preset];
  const [left, right] = children;

  return (
    <div
      data-slot="evi-split"
      data-preset={preset}
      data-align={align}
      className={cn(
        "col-span-12 grid grid-cols-subgrid gap-y-8 md:gap-y-12",
        alignClasses[align],
        className,
      )}
      {...props}
    >
      <div className={cn(cols.left, align === "stretch" && "*:h-full")}>
        {left}
      </div>
      <div className={cn(cols.right, align === "stretch" && "*:h-full")}>
        {right}
      </div>
    </div>
  );
}
