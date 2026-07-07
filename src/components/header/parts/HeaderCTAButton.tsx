import { PrismicNextLink } from "@prismicio/next";
import {
  isFilled,
  type LinkField,
  type LinkResolverFunction,
} from "@prismicio/client";
import { EviButton } from "@/src/components/ui/EviButton";

export type HeaderCTAButtonProps = {
  link: LinkField;
  linkResolver: LinkResolverFunction;
  className?: string;
};

/**
 * Optional CTA button in the header. Renders nothing when link is unfilled
 * or lacks label text — parent can drop it in unconditionally; the
 * component short-circuits internally.
 *
 * Styling comes from EviButton (variant + appearance + size) so the header
 * CTA scales with the rest of the button system — no hardcoded button
 * classes.
 */
export function HeaderCTAButton({
  link,
  linkResolver,
  className,
}: HeaderCTAButtonProps): React.ReactElement | null {
  if (!isFilled.link(link)) return null;
  const label = isFilled.keyText(link.text) ? link.text : null;
  if (!label) return null;

  return (
    <EviButton
      asChild
      variant="primary"
      appearance="solid"
      size="sm"
      className={className}
    >
      <PrismicNextLink field={link} linkResolver={linkResolver}>
        {label}
      </PrismicNextLink>
    </EviButton>
  );
}
