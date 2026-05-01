import { PrismicRichText, type JSXMapSerializer } from "@prismicio/react";
import { PrismicNextLink } from "@prismicio/next";
import {
  type LinkResolverFunction,
  type RichTextField,
  isFilled,
} from "@prismicio/client";
import { twMerge } from "tailwind-merge";

type EviRichTextProps = {
  field: RichTextField | null | undefined;
  linkResolver: LinkResolverFunction;
  bare?: boolean;
  className?: string;
  isHero?: boolean;
};

export function EviRichText({
  field,
  linkResolver,
  bare = false,
  className,
  isHero,
}: EviRichTextProps) {
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
    <div className={twMerge("evi-prose", className)}>
      {content}
    </div>
  );
}
