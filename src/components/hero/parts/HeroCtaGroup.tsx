import type { LinkField, LinkResolverFunction } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { EviButton } from "@/src/components/ui/EviButton";
import { EviStack } from "@/src/components/layout/EviStack";
import { is_link_filled } from "@/src/lib/prismic/links";

export type HeroCtaGroupProps = {
  /** Primær CTA (solid). */
  primary: LinkField;
  /** Sekundær CTA (outline). */
  secondary: LinkField;
  linkResolver: LinkResolverFunction;
  /** Vandret justering af knap-rækken. @default "start" */
  align?: "start" | "center";
};

/**
 * Delt CTA-række for hero-variationer: primær (solid) + valgfri sekundær
 * (outline), begge `size="lg"`. Rendrer intet hvis ingen af dem er udfyldt.
 */
export function HeroCtaGroup({
  primary,
  secondary,
  linkResolver,
  align = "start",
}: HeroCtaGroupProps): React.ReactElement | null {
  const has_primary = is_link_filled(primary);
  const has_secondary = is_link_filled(secondary);
  if (!has_primary && !has_secondary) return null;

  return (
    <EviStack
      direction="row"
      wrap
      gap="sm"
      justify={align === "center" ? "center" : "start"}
    >
      {has_primary && (
        <EviButton asChild variant="primary" appearance="solid" size="lg">
          <PrismicNextLink field={primary} linkResolver={linkResolver} />
        </EviButton>
      )}
      {has_secondary && (
        <EviButton asChild variant="primary" appearance="outline" size="lg">
          <PrismicNextLink field={secondary} linkResolver={linkResolver} />
        </EviButton>
      )}
    </EviStack>
  );
}
