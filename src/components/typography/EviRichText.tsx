import { PrismicRichText, type JSXMapSerializer } from "@prismicio/react";
import { PrismicNextLink } from "@prismicio/next";
import {
  type LinkResolverFunction,
  type RichTextField,
  isFilled,
} from "@prismicio/client";
import { cn } from "@/src/lib/utils/cn";

export type EviRichTextProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Prismic rich-text field. Komponenten rendrer ingenting hvis feltet er tomt. */
  field: RichTextField | null | undefined;
  /** Bruges til at resolve interne dokument-links. */
  linkResolver: LinkResolverFunction;
  /** Drop `<div class="evi-prose">` wrapper — fx når en parent (EviHeadingGroup) allerede har den. @default false */
  bare?: boolean;
  /**
   * Heading-niveau-shift:
   * - `true` (hero brugt med h2-default): h2 → h1
   * - `false` (alm. slice med h1-default): h1 → h2
   * - `undefined`: ingen ændring
   */
  isHero?: boolean;
};

export function EviRichText({
  field,
  linkResolver,
  bare = false,
  className,
  isHero,
  ...props
}: EviRichTextProps): React.ReactElement | null {
  if (!isFilled.richText(field)) return null;

  const headingOverrides: JSXMapSerializer = {};

  if (isHero === true) {
    // Slice med h2-default brugt som hero → h2 bliver h1
    headingOverrides.heading2 = ({ children }: { children: React.ReactNode }) => (
      <h1>{children}</h1>
    );
  } else if (isHero === false) {
    // Slice med h1-default brugt som alm. slice → h1 bliver h2
    headingOverrides.heading1 = ({ children }: { children: React.ReactNode }) => (
      <h2>{children}</h2>
    );
  }

  const content = (
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

  if (bare) return content;

  return (
    <div
      data-slot="evi-rich-text"
      className={cn("evi-prose", className)}
      {...props}
    >
      {content}
    </div>
  );
}
