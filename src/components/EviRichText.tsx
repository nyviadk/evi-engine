import { PrismicRichText } from "@prismicio/react";
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
};

export function EviRichText({
  field,
  linkResolver,
  bare = false,
  className,
}: EviRichTextProps) {
  if (!isFilled.richText(field)) return null;

  const content = (
    <PrismicRichText
      field={field}
      components={{
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
