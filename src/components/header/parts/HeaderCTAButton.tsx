import { PrismicNextLink } from "@prismicio/next";
import { type LinkField, type LinkResolverFunction } from "@prismicio/client";
import { is_link_filled } from "@/src/lib/prismic/links";
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
  if (!is_link_filled(link)) return null;

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
