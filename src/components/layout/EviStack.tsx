import { cn } from "@/src/lib/utils/cn";

type Gap = "xs" | "sm" | "md" | "lg" | "xl";

export type EviStackProps = React.ComponentProps<"div"> & {
  /** Vertikal afstand mellem børn. @default "md" */
  gap?: Gap;
};

const gapClasses: Record<Gap, string> = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

export function EviStack({
  gap = "md",
  className,
  ...props
}: EviStackProps): React.ReactElement {
  return (
    <div
      data-slot="evi-stack"
      className={cn("flex flex-col", gapClasses[gap], className)}
      {...props}
    />
  );
}
