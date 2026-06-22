import { PrismicRichText, type RichTextComponents } from "@prismicio/react";
import { PrismicNextLink } from "@prismicio/next";
import {
  type LinkResolverFunction,
  type RichTextField,
  isFilled,
} from "@prismicio/client";
import { cn } from "@/src/lib/utils/cn";

/**
 * EviRichText — Prismic rich-text renderer.
 *
 * - `<EviRichText>` (default): wrapper'er output i `<div class="evi-prose">`
 *   så typografi-stylingen aktiveres. Bruges fra slices direkte.
 * - `<EviRichText.Raw>`: returnerer den serialiserede markup uden wrapper.
 *   Bruges når en parent (fx EviHeadingGroup) allerede har `.evi-prose`-class
 *   og du ikke vil have et ekstra DOM-niveau.
 *
 * Hyperlinks routes automatisk gennem PrismicNextLink med linkResolver.
 * isHero shifter h1 ↔ h2 så slice-defaults kan matche faktisk brug uden
 * at content-editoren skal vide om heading-niveauer.
 */

type SharedProps = {
  /** Prismic rich-text field. Komponenten rendrer ingenting hvis feltet er tomt. */
  field: RichTextField | null | undefined;
  /** Resolver til interne dokument-links. */
  linkResolver: LinkResolverFunction;
  /**
   * Heading-niveau-shift:
   * - `true` (hero brugt med h2-default): h2 → h1
   * - `false` (alm. slice med h1-default): h1 → h2
   * - `undefined`: ingen ændring
   */
  isHero?: boolean;
};

export type EviRichTextRawProps = SharedProps;
export type EviRichTextProps = SharedProps &
  Omit<React.ComponentProps<"div">, "children">;

/** Returnerer den serialiserede PrismicRichText uden wrapper-element. */
function Raw({
  field,
  linkResolver,
  isHero,
}: EviRichTextRawProps): React.ReactElement | null {
  if (!isFilled.richText(field)) return null;

  const headingOverrides: RichTextComponents = {};

  if (isHero === true) {
    headingOverrides.heading2 = ({
      children,
    }: {
      children: React.ReactNode;
    }) => <h1>{children}</h1>;
  } else if (isHero === false) {
    headingOverrides.heading1 = ({
      children,
    }: {
      children: React.ReactNode;
    }) => <h2>{children}</h2>;
  }

  return (
    <PrismicRichText
      field={field}
      components={{
        ...headingOverrides,
        hyperlink: ({ node, children }) => (
          <PrismicNextLink field={node.data} linkResolver={linkResolver}>
            {children}
          </PrismicNextLink>
        ),
      }}
    />
  );
}

function Root({
  field,
  linkResolver,
  isHero,
  className,
  ...props
}: EviRichTextProps): React.ReactElement | null {
  if (!isFilled.richText(field)) return null;

  return (
    <div
      data-slot="evi-rich-text"
      className={cn("evi-prose", className)}
      {...props}
    >
      <Raw field={field} linkResolver={linkResolver} isHero={isHero} />
    </div>
  );
}

export const EviRichText = Object.assign(Root, { Raw });
