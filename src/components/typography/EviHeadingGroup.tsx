import {
  type RichTextField,
  type LinkResolverFunction,
  isFilled,
} from "@prismicio/client";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { twMerge } from "tailwind-merge";

interface EviHeadingGroupProps {
  title?: RichTextField | null | undefined;
  description?: RichTextField | null | undefined;
  linkResolver: LinkResolverFunction;
  className?: string;
  isHero?: boolean;
}

export function EviHeadingGroup({
  title,
  description,
  linkResolver,
  className,
  isHero,
}: EviHeadingGroupProps) {
  if (!isFilled.richText(title) && !isFilled.richText(description)) return null;

  return (
    <hgroup className={twMerge("col-span-12 evi-prose max-w-prose", className)}>
      <EviRichText field={title} linkResolver={linkResolver} bare isHero={isHero} />
      <EviRichText field={description} linkResolver={linkResolver} bare />
    </hgroup>
  );
}
