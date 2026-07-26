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
   * Heading-niveau-shift efter slice-position, så siden har præcis én h1:
   * `true` (hero) opgraderer h2→h1; `false` degraderer h1→h2; `undefined` = ingen
   * shift. Sættes automatisk af `compute_slice_contexts`.
   */
  isHero?: boolean;
  /**
   * Ekstra block-overrides merget oveni built-ins; caller wins ved overlap
   * (fx FooterCopyright der prepender "© {year} " til paragraphs).
   */
  extraComponents?: RichTextComponents;
};

type EviRichTextRawProps = SharedProps;
type EviRichTextProps = SharedProps &
  Omit<React.ComponentProps<"div">, "children">;

// Heading-overrides hoistet til modul-niveau — capture ingen variabler, så de
// deles frem for at genskabes pr. render (jf. vercel-react-best-practices).
const HEADING_OVERRIDES_HERO: RichTextComponents = {
  heading2: ({ children }: { children: React.ReactNode }) => (
    <h1>{children}</h1>
  ),
};
const HEADING_OVERRIDES_NON_HERO: RichTextComponents = {
  heading1: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
};

/** Returnerer den serialiserede PrismicRichText uden wrapper-element. */
function Raw({
  field,
  linkResolver,
  isHero,
  extraComponents,
}: EviRichTextRawProps): React.ReactElement | null {
  if (!isFilled.richText(field)) return null;

  const headingOverrides =
    isHero === true
      ? HEADING_OVERRIDES_HERO
      : isHero === false
        ? HEADING_OVERRIDES_NON_HERO
        : null;

  // hyperlink-serializeren capture'r linkResolver → må defineres pr. render.
  // Server component, ingen remount-bivirkninger → acceptabelt.
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
        ...extraComponents,
      }}
    />
  );
}

function Root({
  field,
  linkResolver,
  isHero,
  extraComponents,
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
      <Raw
        field={field}
        linkResolver={linkResolver}
        isHero={isHero}
        extraComponents={extraComponents}
      />
    </div>
  );
}

export const EviRichText = Object.assign(Root, { Raw });
