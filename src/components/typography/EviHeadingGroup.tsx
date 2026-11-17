import {
  type RichTextField,
  type LinkResolverFunction,
  isFilled,
} from "@prismicio/client";
import { type RichTextComponents } from "@prismicio/react";
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
  align?: Align;
  /**
   * Justering under md, når sektionens indhold står anderledes dér end på
   * desktop, fx en FAQ-liste i fuld bredde under en centreret overskrift. Fra md
   * gælder `align`. @default align
   */
  mobileAlign?: Align;
  /**
   * Markør forrest i overskriften, fx en tidslinjes stjerne. Overskriften er
   * `relative`, så markøren kan placere sig selv (fx `top-[0.5lh]` = første linje).
   */
  marker?: React.ReactNode;
};

type Align = "start" | "center" | "end";

const ALIGN: Record<Align, string> = {
  start: "",
  center: "text-center *:mx-auto",
  end: "text-right *:ml-auto",
};

// Overstyrer ALIGN fra md, inkl. nulstilling af marginerne fra mobil-justeringen.
const ALIGN_MD: Record<Align, string> = {
  start: "md:text-left md:*:mx-0",
  center: "md:text-center md:*:mx-auto",
  end: "md:text-right md:*:mr-0 md:*:ml-auto",
};

/** h1/h2 med markøren forrest, med samme niveau-shift som EviRichText's isHero. */
function marker_headings(marker: React.ReactNode, isHero?: boolean): RichTextComponents {
  const H1 = isHero === false ? "h2" : "h1";
  const H2 = isHero === true ? "h1" : "h2";
  return {
    heading1: ({ children }) => (
      <H1 className="relative">
        {marker}
        {children}
      </H1>
    ),
    heading2: ({ children }) => (
      <H2 className="relative">
        {marker}
        {children}
      </H2>
    ),
  };
}

export function EviHeadingGroup({
  title,
  description,
  linkResolver,
  isHero,
  align = "start",
  mobileAlign = align,
  marker,
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
        // Justeringen følger sektionens indhold på hver bredde: en venstrestillet
        // overskrift over centrerede knapper på mobil ligner en fejl, og omvendt.
        ALIGN[mobileAlign],
        mobileAlign !== align && ALIGN_MD[align],
        className,
      )}
      {...props}
    >
      <EviRichText.Raw
        field={title}
        linkResolver={linkResolver}
        isHero={isHero}
        extraComponents={marker ? marker_headings(marker, isHero) : undefined}
      />
      <EviRichText.Raw field={description} linkResolver={linkResolver} />
    </hgroup>
  );
}
