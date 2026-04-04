import {
  type RichTextField,
  type LinkResolverFunction,
  isFilled,
} from "@prismicio/client";
import { EviRichText } from "@/src/components/EviRichText";
import { twMerge } from "tailwind-merge";

interface EviHeadingGroupProps {
  title?: RichTextField | null | undefined;
  description?: RichTextField | null | undefined;
  linkResolver: LinkResolverFunction;
  className?: string;
}

export function EviHeadingGroup({
  title,
  description,
  linkResolver,
  className,
}: EviHeadingGroupProps) {
  if (!isFilled.richText(title) && !isFilled.richText(description)) return null;

  return (
    <hgroup className={twMerge("col-span-12 evi-prose max-w-prose", className)}>
      <EviRichText field={title} linkResolver={linkResolver} bare />
      <EviRichText field={description} linkResolver={linkResolver} bare />
    </hgroup>
  );
}
