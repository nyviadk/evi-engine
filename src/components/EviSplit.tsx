import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

type SplitPreset = "50-50" | "60-40" | "40-60" | "33-67" | "67-33";

interface EviSplitProps {
  preset: SplitPreset;
  align?: "start" | "center" | "end" | "stretch";
  children: [ReactNode, ReactNode];
  className?: string;
}

const presetClasses: Record<SplitPreset, { left: string; right: string }> = {
  "50-50": {
    left:  "col-span-12 @3xl/section:col-span-6",
    right: "col-span-12 @3xl/section:col-span-6",
  },
  "60-40": {
    left:  "col-span-12 @3xl/section:col-span-7",
    right: "col-span-12 @3xl/section:col-span-5",
  },
  "40-60": {
    left:  "col-span-12 @3xl/section:col-span-5",
    right: "col-span-12 @3xl/section:col-span-7",
  },
  "33-67": {
    left:  "col-span-12 @3xl/section:col-span-4",
    right: "col-span-12 @3xl/section:col-span-8",
  },
  "67-33": {
    left:  "col-span-12 @3xl/section:col-span-8",
    right: "col-span-12 @3xl/section:col-span-4",
  },
};

const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

export function EviSplit({
  preset,
  align = "stretch",
  children,
  className,
}: EviSplitProps) {
  const cols = presetClasses[preset];
  const [left, right] = children;

  return (
    <div
      className={twMerge(
        clsx(
          "col-span-12 grid grid-cols-subgrid gap-y-8 md:gap-y-12",
          alignClasses[align],
        ),
        className,
      )}
    >
      <div className={clsx(cols.left, align === "stretch" && "*:h-full")}>{left}</div>
      <div className={clsx(cols.right, align === "stretch" && "*:h-full")}>{right}</div>
    </div>
  );
}
