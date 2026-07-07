import { EviStack } from "@/src/components/layout/EviStack";
import { cn } from "@/src/lib/utils/cn";

export type EviHeaderInnerProps = React.ComponentProps<"div"> & {
  children: React.ReactNode;
};

/**
 * Inner content wrapper for header slices. Provides:
 *  - `max-w-evi` container (design-token max-width)
 *  - horizontal flex layout, brand-left / actions-right via justify="between"
 *  - centered vertical alignment for mixed heights (logo + nav + button)
 *  - responsive padding
 *
 * Composed from EviStack so all flex + gap semantics come from the design
 * system. Slice files should compose `<EviHeaderShell><EviHeaderInner>...`
 * — never render the max-w + flex + padding combo themselves.
 */
export function EviHeaderInner({
  className,
  children,
  ...props
}: EviHeaderInnerProps): React.ReactElement {
  return (
    <EviStack
      direction="row"
      justify="between"
      align="center"
      gap="md"
      data-slot="evi-header-inner"
      className={cn("max-w-evi mx-auto px-4 py-3", className)}
      {...props}
    >
      {children}
    </EviStack>
  );
}
