import {
  type LinkResolverFunction,
  type RichTextField,
  isFilled,
} from "@prismicio/client";

import { EviStack } from "@/src/components/layout/EviStack";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviTitle } from "@/src/components/typography/EviTitle";
import { PlanioStar } from "@/src/components/planio/PlanioStar";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { evi_card_body_class } from "@/src/lib/utils/card-text";
import { cn } from "@/src/lib/utils/cn";

/**
 * My Planios køreplan: trin på en stiplet linje. Smal: lodret, stjernen til
 * venstre for hvert trin. Fra lg: ét trin pr. kolonne, stjernen øverst og linjen
 * vandret. Rå grid frem for EviAutoGrid/EviStack: kolonnetallet følger antallet
 * af trin (grid-flow-col), og linjen skifter retning sammen med layoutet.
 */
function Root({
  className,
  ...props
}: React.ComponentProps<"ol">): React.ReactElement {
  return (
    <ol
      data-slot="planio-roadmap"
      className={cn(
        "relative col-span-12 grid gap-8 lg:auto-cols-fr lg:grid-flow-col",
        // Linjen går gennem stjernernes midte (stjernen er 2rem).
        "before:absolute before:inset-y-4 before:left-[calc(1rem-0.75px)] before:border-l-[1.5px] before:border-dashed before:border-current/30",
        "lg:before:inset-x-4 lg:before:top-[calc(1rem-0.75px)] lg:before:bottom-auto lg:before:border-t-[1.5px] lg:before:border-l-0",
        className,
      )}
      {...props}
    />
  );
}

/** Ét trin: stjernen ved siden af (smal) eller over (lg) mærkat og tekst. */
function Step({
  className,
  ...props
}: React.ComponentProps<"li">): React.ReactElement {
  return (
    <li
      className={cn(
        "grid grid-cols-[2rem_minmax(0,1fr)] content-start items-start gap-x-4 gap-y-2 lg:grid-cols-1 lg:gap-y-2.5",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Stjernen på linjen: fyldt for det, appen kan i dag, kontur for det, der
 * kommer. Sektionens baggrund bag den skærer linjen over.
 */
function Marker({ current = false }: { current?: boolean }): React.ReactElement {
  return (
    <span aria-hidden className="row-span-2 size-8 bg-(--theme-bg) lg:row-span-1">
      <PlanioStar
        variant={current ? "filled" : "outline"}
        className={cn("size-8", current && "text-evi-primary")}
      />
    </span>
  );
}

/** Mærkaten, fx "I dag" (fyldt) eller "Senere" (kant). Ens størrelse begge veje. */
function Tag({
  field,
  linkResolver,
  current = false,
}: {
  field: RichTextField;
  linkResolver: LinkResolverFunction;
  current?: boolean;
}): React.ReactElement | null {
  if (!isFilled.richText(field)) return null;
  return (
    <span
      className={cn(
        "justify-self-start rounded-full border px-2.5 py-0.5 text-xs font-bold",
        current
          ? "border-transparent bg-evi-primary text-evi-text-on-primary"
          : "border-current/40",
      )}
    >
      <EviRichText.Inline field={field} linkResolver={linkResolver} />
    </span>
  );
}

/** Trinnets titel (heading3) og tekst. */
function Text({
  title,
  body,
  linkResolver,
}: {
  title: RichTextField;
  body: RichTextField;
  linkResolver: LinkResolverFunction;
}): React.ReactElement | null {
  if (!has_rich_text(title, body)) return null;
  return (
    <EviStack gap="sm">
      <EviTitle field={title} linkResolver={linkResolver} size="lg" />
      <EviRichText
        field={body}
        linkResolver={linkResolver}
        className={evi_card_body_class()}
      />
    </EviStack>
  );
}

export const PlanioRoadmap = Object.assign(Root, { Step, Marker, Tag, Text });
