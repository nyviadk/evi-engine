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
   * Vis pil-ikon der animerer ved hover. Pilen er et rent CSS `::after`
   * (mask-image, se globals F) — IKKE et injiceret React-child. Derfor virker den
   * også med `asChild`, hvor child'en (fx et allowText-`PrismicNextLink`) selv
   * rendrer sin label; pilen behøver ingen eksplicitte children at stå ved siden af.
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
