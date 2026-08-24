import {
  isFilled,
  type RichTextField,
  type LinkResolverFunction,
} from "@prismicio/client";

import { EviIcon } from "@/src/components/ui/EviIcon";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { cn } from "@/src/lib/utils/cn";

export type EviIconListItem = {
  /** Iconify-navn (uden prefix = lucide). Tomt → bare tekst (uden ikon). */
  icon?: string | null;
  text?: RichTextField | null;
};

export type EviIconListProps = {
  items: readonly EviIconListItem[];
  linkResolver: LinkResolverFunction;
  className?: string;
};

/**
 * EviIconList — liste af "bart ikon + tekst"-rækker. Modsat EviIconRow/EviIconBadge
 * er ikonet bart (ingen badge-flade). Tomt ikon → bare tekst.
 */
export function EviIconList({
  items,
  linkResolver,
  className,
}: EviIconListProps): React.ReactElement | null {
  const filled = items.filter((it) => isFilled.richText(it.text));
  if (filled.length === 0) return null;

  return (
    <ul data-slot="evi-icon-list" className={cn("grid gap-3", className)}>
      {filled.map((it, i) => (
        <li key={i} className="flex items-start gap-3">
          {isFilled.keyText(it.icon) && (
            <EviIcon
              name={it.icon}
              className="mt-0.5 size-5 shrink-0 text-evi-accent"
            />
          )}
          <div className="evi-prose text-sm [&_p]:m-0">
            <EviRichText.Raw field={it.text} linkResolver={linkResolver} />
          </div>
        </li>
      ))}
    </ul>
  );
}
