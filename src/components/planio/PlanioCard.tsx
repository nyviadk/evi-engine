import {
  isFilled,
  type LinkResolverFunction,
  type RichTextField,
} from "@prismicio/client";
import { Check } from "lucide-react";

import { EviStack } from "@/src/components/layout/EviStack";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { evi_box_class } from "@/src/components/ui/EviBox";
import { PlanioStar } from "@/src/components/planio/PlanioStar";
import { cn } from "@/src/lib/utils/cn";

type TextProps = {
  field: RichTextField | null | undefined;
  linkResolver: LinkResolverFunction;
  className?: string;
};

/** Lyst app-kort (EviBox compact-form), centreret på en PlanioFrame. */
function Root({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      data-slot="planio-card"
      className={cn(
        "theme-light mx-auto flex w-full max-w-100 flex-col gap-4",
        evi_box_class("compact"),
        className,
      )}
      {...props}
    />
  );
}

/** Lille label, fx "PlanioCheck" eller "Det hjælper mig". */
function Label({ field, linkResolver, className }: TextProps): React.ReactElement | null {
  if (!isFilled.richText(field)) return null;
  return (
    <div className={cn("text-xs font-semibold", className)}>
      <EviRichText.Raw field={field} linkResolver={linkResolver} />
    </div>
  );
}

/** Kortets store linje, fx "Foreslået 50%". */
function Title({ field, linkResolver, className }: TextProps): React.ReactElement | null {
  if (!isFilled.richText(field)) return null;
  return (
    <div className={cn("text-xl leading-tight font-bold", className)}>
      <EviRichText.Raw field={field} linkResolver={linkResolver} />
    </div>
  );
}

/** Afsnit med streg over, fx appens svar nederst i kortet. */
function Section({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <EviStack
      gap="sm"
      className={cn("border-t border-current/10 pt-4", className)}
      {...props}
    />
  );
}

/** Mærke for noget appen ikke kan endnu. Tomt felt → intet mærke. */
function FutureBadge({
  field,
  linkResolver,
  className,
}: TextProps): React.ReactElement | null {
  if (!isFilled.richText(field)) return null;
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 text-xs font-bold tracking-wider uppercase",
        className,
      )}
    >
      <PlanioStar variant="outline" className="size-3" />
      <EviRichText.Inline field={field} linkResolver={linkResolver} />
    </span>
  );
}

/** Brugerens egen note: stiplet ramme. */
function Note({ field, linkResolver, className }: TextProps): React.ReactElement | null {
  if (!isFilled.richText(field)) return null;
  return (
    <div
      className={cn(
        "rounded-evi border border-dashed border-current/30 px-3.5 py-3 text-sm",
        className,
      )}
    >
      <EviRichText.Raw field={field} linkResolver={linkResolver} />
    </div>
  );
}

/** Række af mærker (chips). */
function Chips({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return <EviStack direction="row" wrap gap="xs" className={className} {...props} />;
}

/**
 * Et mærke. Valgte mærker har fuld kant og et flueben; begge har 2px kant, så
 * de er lige store. rounded-2xl er en pille på én linje og et pænt afrundet
 * felt, når teksten må brydes; fluebenet flyder med teksten.
 */
function Chip({
  field,
  linkResolver,
  selected = false,
}: TextProps & { selected?: boolean }): React.ReactElement | null {
  if (!isFilled.richText(field)) return null;
  return (
    <span
      data-selected={selected || undefined}
      className={cn(
        "inline-block max-w-full rounded-2xl border-2 px-3 py-1 text-sm wrap-break-word hyphens-auto",
        selected ? "border-current font-bold" : "border-current/15 font-semibold",
      )}
    >
      {selected && (
        <Check className="mr-1 inline size-3.5 align-[-0.125em]" strokeWidth={3} />
      )}
      <EviRichText.Inline field={field} linkResolver={linkResolver} />
    </span>
  );
}

export const PlanioCard = Object.assign(Root, {
  Label,
  Title,
  Section,
  FutureBadge,
  Note,
  Chips,
  Chip,
});
