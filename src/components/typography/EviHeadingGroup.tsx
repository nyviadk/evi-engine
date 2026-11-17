import {
  type RichTextField,
  type LinkResolverFunction,
  isFilled,
} from "@prismicio/client";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { cn } from "@/src/lib/utils/cn";

export type EviHeadingGroupProps = Omit<
  React.ComponentProps<"hgroup">,
  "children" | "title"
> & {
  /** Overskrift (Prismic rich-text). */
  title?: RichTextField | null | undefined;
  /** Underrubrik (Prismic rich-text). */
  description?: RichTextField | null | undefined;
  /** Bruges til at resolve interne dokument-links i title/description. */
  linkResolver: LinkResolverFunction;
  /** Heading-niveau-shift på title — se EviRichText. */
  isHero?: boolean;
  /** Tekst-justering, ens på alle bredder, så den følger sektionens øvrige
   *  indhold (knapper, ikoner). @default "start" */
  align?: "start" | "center" | "end";
};

export function EviHeadingGroup({
  title,
  description,
  linkResolver,
  isHero,
  align = "start",
  className,
  ...props
}: EviHeadingGroupProps): React.ReactElement | null {
  if (!isFilled.richText(title) && !isFilled.richText(description)) return null;

  return (
    <hgroup
      data-slot="evi-heading-group"
      data-align={align}
      className={cn(
        "evi-prose col-span-12",
        // Measure PER element: `ch` regnes på elementets egen (clamp-fluide)
        // størrelse → overskrifter ~30ch, brødtekst det læsbare ~65ch.
        "[&>h1]:max-w-[30ch] [&>h2]:max-w-[30ch] [&>h3]:max-w-[30ch] [&>p]:max-w-prose",
        // Samme justering på alle bredder: en venstrestillet overskrift over
        // centrerede knapper på mobil ligner en fejl.
        align === "center" && "text-center *:mx-auto",
        align === "end" && "text-right *:ml-auto",
        className,
      )}
      {...props}
    >
      <EviRichText.Raw
        field={title}
        linkResolver={linkResolver}
        isHero={isHero}
      />
      <EviRichText.Raw field={description} linkResolver={linkResolver} />
    </hgroup>
  );
}
