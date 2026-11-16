import {
  isFilled,
  type KeyTextField,
  type LinkResolverFunction,
  type RichTextField,
} from "@prismicio/client";

import { EviStack } from "@/src/components/layout/EviStack";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { PlanioStar } from "@/src/components/planio/PlanioStar";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { evi_card_title_class } from "@/src/lib/utils/card-text";
import { cn } from "@/src/lib/utils/cn";

// Markørerne sidder i overskriften, så 0.5lh rammer midten af dens første
// linje uanset størrelse, og -left-(--rail) sætter dem på skinnen.
const MARKER = "absolute top-[0.5lh] -left-(--rail) -translate-1/2";

/**
 * My Planios tidslinje: en lodret skinne med stjernen ved overskriften og en
 * prik ved hvert tidspunkt. Sidder i EviSections grid (fuld bredde).
 */
function Root({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      data-slot="planio-timeline"
      className={cn(
        "relative col-span-12 flex flex-col gap-12 pl-(--rail) [--rail:1.5rem] md:gap-16 md:[--rail:3rem]",
        "before:absolute before:top-7 before:bottom-0 before:left-0 before:border-l before:border-current/20",
        className,
      )}
      {...props}
    />
  );
}

export type PlanioTimelineHeaderProps = {
  /** Overskrift (heading2). Fed tekst står frem mod den lette vægt. */
  title: RichTextField;
  description: RichTextField;
  linkResolver: LinkResolverFunction;
  isHero?: boolean;
};

/** Overskrift med stjernen på skinnen + brødtekst i lead-størrelse. */
function Header({
  title,
  description,
  linkResolver,
  isHero,
}: PlanioTimelineHeaderProps): React.ReactElement | null {
  if (!has_rich_text(title, description)) return null;
  const Heading = isHero ? "h1" : "h2";

  return (
    <EviStack as="hgroup" gap="lg">
      <EviRichText
        field={title}
        linkResolver={linkResolver}
        isHero={isHero}
        className="[&_h1]:max-w-[30ch] [&_h1]:font-light [&_h2]:max-w-[30ch] [&_h2]:font-light"
        extraComponents={{
          heading2: ({ children }) => (
            <Heading className="relative">
              <span
                aria-hidden
                className={cn(
                  MARKER,
                  "flex size-9.5 items-center justify-center rounded-full bg-(--theme-bg)",
                )}
              >
                <PlanioStar className="size-6.5 text-evi-primary" />
              </span>
              {children}
            </Heading>
          ),
        }}
      />
      <EviRichText
        field={description}
        linkResolver={linkResolver}
        className="evi-lead max-w-prose"
      />
    </EviStack>
  );
}

/** Tidspunkterne som ordnet liste. */
function List({
  className,
  ...props
}: React.ComponentProps<"ol">): React.ReactElement {
  return (
    <ol className={cn("flex flex-col gap-12 md:gap-16", className)} {...props} />
  );
}

/**
 * Ét tidspunkt: et 12-kol grid (som `EviRow grid`), så en EviSplit kan
 * subgride, men som `<li>`. Mindre kolonne-gap end sektionens md:gap-x-16:
 * skinnen tager 3rem, og 11 × 4rem kan ikke være der ved 768–783px.
 */
function Item({
  className,
  ...props
}: React.ComponentProps<"li">): React.ReactElement {
  return (
    <li
      className={cn(
        "grid grid-cols-12 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12 lg:gap-x-16",
        className,
      )}
      {...props}
    />
  );
}

export type PlanioTimelineTitleProps = {
  /** Klokkeslæt foran titlen, fx "07.15". */
  time: KeyTextField;
  /** Titel (heading3). */
  title: RichTextField;
  linkResolver: LinkResolverFunction;
};

/** Tidspunktets titel med prikken på skinnen og klokkeslættet i let vægt. */
function Title({
  time,
  title,
  linkResolver,
}: PlanioTimelineTitleProps): React.ReactElement | null {
  if (!isFilled.richText(title)) return null;

  return (
    <div
      data-slot="planio-timeline-title"
      className={cn(evi_card_title_class("xl"), "sm:[&_h3]:text-2xl")}
    >
      <EviRichText.Raw
        field={title}
        linkResolver={linkResolver}
        extraComponents={{
          heading3: ({ children }) => (
            <h3 className="relative">
              <span
                aria-hidden
                className={cn(
                  MARKER,
                  "size-2.75 rounded-full bg-evi-primary ring-6 ring-(--theme-bg)",
                )}
              />
              {isFilled.keyText(time) && (
                <span className="font-light">{`${time} `}</span>
              )}
              {children}
            </h3>
          ),
        }}
      />
    </div>
  );
}

export const PlanioTimeline = Object.assign(Root, { Header, List, Item, Title });
