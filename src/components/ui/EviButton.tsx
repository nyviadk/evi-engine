import { Slot } from "@radix-ui/react-slot";
import { ArrowRight } from "lucide-react";
import { cn } from "@/src/lib/utils/cn";

type Variant = "primary" | "secondary" | "neutral";
type Appearance = "solid" | "outline" | "text";
type Size = "sm" | "md" | "lg";

const iconSizes: Record<Size, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

export type EviButtonProps = React.ComponentProps<"button"> & {
  /** Visuel rolle: primary, secondary, eller neutral. @default "primary" */
  variant?: Variant;
  /** Fyld-stil: solid, outline, eller text. @default "solid" */
  appearance?: Appearance;
  /** Knappens størrelse. @default "md" */
  size?: Size;
  /** Vis pil-ikon der animerer ved hover (kun når asChild=false). @default false */
  arrow?: boolean;
  /**
   * Render det første child som rod-elementet i stedet for `<button>`, og
   * komponer button-stylingen + alle props/handlers på det. Brug fx til at
   * style et `<PrismicNextLink>` som en knap uden at duplikere markup:
   *
   * @example
   * <EviButton asChild variant="primary">
   *   <PrismicNextLink field={cta_link}>Læs mere</PrismicNextLink>
   * </EviButton>
   *
   * Når asChild=true er `arrow`-prop'en uden effekt; consumer komponerer
   * selv evt. ikon ind i sit child-element.
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

  // Slot kræver præcis ét direkte child og merger props på det.
  // Når vi selv render <button>, wrapper vi i vores standard text+icon layout.
  const content = asChild ? (
    children
  ) : (
    <>
      <span className="trim-text">{children}</span>
      {arrow && (
        <ArrowRight
          size={iconSizes[size]}
          className="btn-arrow-icon shrink-0"
        />
      )}
    </>
  );

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
      {content}
    </Comp>
  );
}
