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

export function HeaderCTAButton({
  link,
  linkResolver,
  className,
}: HeaderCTAButtonProps): React.ReactElement | null {
  if (!isFilled.link(link) || !isFilled.keyText(link.text)) return null;

  return (
    <EviButton
      asChild
      variant="primary"
      appearance="solid"
      size="sm"
      className={className}
    >
      <PrismicNextLink field={link} linkResolver={linkResolver} />
    </EviButton>
  );
}
