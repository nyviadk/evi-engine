import {
  isFilled,
  type RichTextField,
  type LinkField,
  type LinkResolverFunction,
} from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { is_link_filled } from "@/src/lib/prismic/links";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviButton } from "@/src/components/ui/EviButton";

export type EviSectionHeaderProps = {
  /** Overskrift (Prismic rich-text). */
  title?: RichTextField | null;
  /** Brødtekst under overskriften (Prismic rich-text). */
  description?: RichTextField | null;
  /** Valgfri "Se alle"-CTA (allowText-link). Udfyldt → header venstre + knap højre. */
  ctaLink?: LinkField;
  linkResolver: LinkResolverFunction;
  /** Heading-niveau-shift — se EviRichText. */
  isHero?: boolean;
  /**
   * Tekst-justering af overskriften. Gælder KUN uden CTA — MED en CTA er headeren
   * altid venstrestillet (knap yderst til højre), da centrering + knap ser skævt
   * ud. @default "center"
   */
  align?: "start" | "center";
};

/**
 * Sektion-header: overskrift + brødtekst, med valgfri CTA yderst til højre.
 *
 * - **Uden CTA** → centreret overskrift (klassisk sektion-intro).
 * - **Med CTA** → overskrift venstre-stillet + knap top-flugtet yderst til højre
 *   (wrapper under på mobil). Knappen relaterer til titlen (det primære element).
 */
export function EviSectionHeader({
  title,
  description,
  ctaLink,
  linkResolver,
  isHero,
  align = "center",
}: EviSectionHeaderProps): React.ReactElement | null {
  const hasCta = ctaLink !== undefined && is_link_filled(ctaLink);

  if (!isFilled.richText(title) && !isFilled.richText(description) && !hasCta) {
    return null;
  }

  if (hasCta && ctaLink) {
    return (
      <EviStack
        direction="row"
        justify="between"
        align="start"
        wrap
        gap="md"
        className="col-span-12"
      >
        <EviHeadingGroup
          title={title}
          description={description}
          linkResolver={linkResolver}
          isHero={isHero}
          align="start"
        />
        <EviButton
          asChild
          variant="primary"
          appearance="outline"
          className="shrink-0"
        >
          <PrismicNextLink field={ctaLink} linkResolver={linkResolver} />
        </EviButton>
      </EviStack>
    );
  }

  return (
    <EviHeadingGroup
      title={title}
      description={description}
      linkResolver={linkResolver}
      isHero={isHero}
      align={align}
    />
  );
}
