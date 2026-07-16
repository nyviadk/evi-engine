import { Children, cloneElement, type ReactElement, type ReactNode } from "react";
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
  /**
   * Vis pil-ikon der animerer ved hover. Virker også med `asChild` — da klones
   * child'en og pilen tilføjes som ekstra child. Bemærk: med `asChild` skal
   * child'en selv rendre sin synlige label som children (fx `{field.text}` på et
   * allowText-`PrismicNextLink`), ellers har pilen intet at stå ved siden af.
   *
   * KONVENTION: pil bruges KUN med `appearance="text"`. Tekst-links mangler
   * knap-chrome, så pilen giver dem "videre"-affordance; solid/outline-knapper er
   * selv-tydelige → pil = overflødig pynt (`feedback_button_arrow_convention`).
   * @default false
   */
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

  const arrowIcon = arrow ? (
    <ArrowRight
      key="evi-btn-arrow"
      size={iconSizes[size]}
      className="btn-arrow-icon shrink-0"
      aria-hidden
    />
  ) : null;

  // Slot kræver præcis ét direkte child og merger props på det. For at pilen
  // også virker med asChild kloner vi child'en og tilføjer pilen efter dens egne
  // children (child'en beholder sin label + href/handlers). Uden arrow lades
  // child'en urørt. Ikke-asChild: vores standard text+icon-layout.
  let content: ReactNode;
  if (asChild) {
    if (arrowIcon) {
      const child = Children.only(children) as ReactElement<{
        children?: ReactNode;
      }>;
      content = cloneElement(child, undefined, child.props.children, arrowIcon);
    } else {
      content = children;
    }
  } else {
    content = (
      <>
        <span className="trim-text">{children}</span>
        {arrowIcon}
      </>
    );
  }

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
