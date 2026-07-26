import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/src/lib/utils/cn";

type Variant = "primary" | "secondary" | "neutral";
type Appearance = "solid" | "outline" | "text";
type Size = "sm" | "md" | "lg";

export type EviButtonProps = React.ComponentProps<"button"> & {
  /** Visuel rolle: primary, secondary, eller neutral. @default "primary" */
  variant?: Variant;
  /** Fyld-stil: solid, outline, eller text. @default "solid" */
  appearance?: Appearance;
  /** Knappens størrelse. @default "md" */
  size?: Size;
  /**
   * Hover-animeret pil. Rent CSS `::after` (mask-image) — ikke et React-child, så
   * den virker også med `asChild`. KONVENTION: kun med `appearance="text"`
   * (`feedback_button_arrow_convention`). @default false
   */
  arrow?: boolean;
  /**
   * Render child'en som rod-element og komponer button-styling + props på det
   * (fx style et `<PrismicNextLink>` som knap uden duplikeret markup).
   *
   * @example
   * <EviButton asChild variant="primary">
   *   <PrismicNextLink field={cta_link} />
   * </EviButton>
   *
   * @default false
   */
  asChild?: boolean;
};

export function EviButton({
  variant = "primary",
  appearance = "solid",
  size = "md",
  arrow = false,
  asChild = false,
  className,
  children,
  ...props
}: EviButtonProps): React.ReactElement {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="evi-button"
      data-variant={variant}
      data-appearance={appearance}
      data-size={size}
      className={cn(
        "btn",
        `btn-${size}`,
        `btn-${variant}-${appearance}`,
        arrow && "btn-arrow",
        className,
      )}
      {...props}
    >
      {asChild ? children : <span className="trim-text">{children}</span>}
    </Comp>
  );
}
