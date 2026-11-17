import {
  isFilled,
  type KeyTextField,
  type LinkResolverFunction,
  type RichTextField,
} from "@prismicio/client";

import {
  EviHeadingGroup,
  type EviHeadingGroupProps,
} from "@/src/components/typography/EviHeadingGroup";
import { EviTitle } from "@/src/components/typography/EviTitle";
import { PlanioStar } from "@/src/components/planio/PlanioStar";
import { cn } from "@/src/lib/utils/cn";

// Markørerne sidder i overskriften, så 0.5lh rammer midten af dens første
// linje uanset størrelse, og -left-(--rail) sætter dem på skinnen.
const MARKER = "absolute top-[0.5lh] -left-(--rail) -translate-1/2";

/**
 * My Planios tidslinje: en lodret skinne med stjernen ved overskriften og en
 * prik ved hvert tidspunkt. Root, liste og tidspunkter er subgrids af sektionens
 * gitter, så kortene står i sektionens kolonner som i alle andre sektioner.
 * Skinnen ligger i gitterets venstre kant, og teksten rykker ind ved siden af den.
 */
function Root({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      data-slot="planio-timeline"
      className={cn(
        "relative col-span-12 grid grid-cols-subgrid gap-y-12 [--rail:1.5rem] md:gap-y-16 md:[--rail:3rem]",
        "before:absolute before:top-7 before:bottom-0 before:left-0 before:border-l before:border-current/20",
        className,
      )}
      {...props}
    />
  );
}

/** EviHeadingGroup med stjernen på skinnen og let vægt, så fed tekst står frem. */
function Header({
  className,
  ...props
}: Omit<EviHeadingGroupProps, "marker" | "align">): React.ReactElement {
  return (
    <EviHeadingGroup
      className={cn("ps-(--rail) [&>h1]:font-light [&>h2]:font-light", className)}
      marker={
        <span
          aria-hidden
          className={cn(
            MARKER,
            "flex size-9.5 items-center justify-center rounded-full bg-(--theme-bg)",
          )}
        >
          <PlanioStar className="size-6.5 text-evi-primary" />
        </span>
      }
      {...props}
    />
  );
}

/** Tidspunkterne som ordnet liste. */
function List({
  className,
  ...props
}: React.ComponentProps<"ol">): React.ReactElement {
  return (
    <ol
      className={cn("col-span-12 grid grid-cols-subgrid gap-y-12 md:gap-y-16", className)}
      {...props}
    />
  );
}

/** Ét tidspunkt. Afstanden mellem tekst og kort/demo er EviSplits. */
function Item({
  className,
  ...props
}: React.ComponentProps<"li">): React.ReactElement {
  return (
    <li
      className={cn("col-span-12 grid grid-cols-subgrid gap-y-8 md:gap-y-12", className)}
      {...props}
    />
  );
}

/** Indhold på sporet: rykket ind til højre for skinnen. */
function Content({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return <div className={cn("ps-(--rail)", className)} {...props} />;
}

/** Kortet ved siden af teksten. Står det under teksten, rykker det også ind. */
function Aside({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return <div className={cn("ps-(--rail) @3xl/section:ps-0", className)} {...props} />;
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
  return (
    <EviTitle
      field={title}
      linkResolver={linkResolver}
      size="xl"
      className="sm:[&_h3]:text-2xl"
      marker={
        <>
          <span
            aria-hidden
            className={cn(
              MARKER,
              "size-2.75 rounded-full bg-evi-primary ring-6 ring-(--theme-bg)",
            )}
          />
          {isFilled.keyText(time) && <span className="font-light">{`${time} `}</span>}
        </>
      }
    />
  );
}

export const PlanioTimeline = Object.assign(Root, {
  Header,
  List,
  Item,
  Content,
  Aside,
  Title,
});
