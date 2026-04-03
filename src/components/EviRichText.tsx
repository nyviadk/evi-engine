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
  className?: string;
};

export function EviRichText({
  field,
  linkResolver,
  className,
}: EviRichTextProps) {
  if (!isFilled.richText(field)) return null;

  return (
    <div className={twMerge("evi-prose", className)}>
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
    </div>
  );
}
