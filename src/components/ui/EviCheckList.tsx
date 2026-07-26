import {
  isFilled,
  type RichTextField,
  type LinkResolverFunction,
} from "@prismicio/client";

import {
  EviIconList,
  type EviIconListItem,
} from "@/src/components/ui/EviIconList";
import { cn } from "@/src/lib/utils/cn";

export type EviCheckListProps = {
  /** Rich-text-felt tænkt som punktliste (kun list-item). Tomt → intet render. */
  field: RichTextField | null | undefined;
  /**
   * Iconify-navn for HELE listen (uden prefix = lucide). Tomt → "check". Ét delt
   * ikon — vores svar på at et list-felt ikke kan bære ikon pr. række.
   */
  icon?: string | null;
  linkResolver: LinkResolverFunction;
  /** Ekstra klasser på `<ul>`. */
  className?: string;
};

/**
 * EviCheckList — render et list-felt som en "checkliste" med ÉT delt ikon (default
 * check). Tynd wrapper over [[EviIconList]]: hver blok (list-item ELLER en "stray"
 * paragraph — Prismic kan ikke fjerne paragraph helt som base-blok) konverteres til
 * en paragraph og bliver ét punkt, alle med samme ikon. Løser repeatable-i-
 * repeatable (ét list-felt frem for en nested gruppe) og genbruger ikon+tekst-
 * render'en frem for at duplikere den.
 */
export function EviCheckList({
  field,
  icon,
  linkResolver,
  className,
}: EviCheckListProps): React.ReactElement | null {
  if (!isFilled.richText(field)) return null;

  const iconName = isFilled.keyText(icon) ? icon : "check";
  // list-item/o-list-item → paragraph, så teksten render'es UDEN liste-wrapper
  // (ellers gav en list-blok et nested <ul><li>). Inline fed/kursiv/links (spans)
  // følger med. Hvert punkt deler `iconName`.
  const items: EviIconListItem[] = field.map((block) => ({
    icon: iconName,
    text: [{ ...block, type: "paragraph" }] as RichTextField,
  }));

  return (
    <EviIconList
      items={items}
      linkResolver={linkResolver}
      className={cn("gap-2", className)}
    />
  );
}
