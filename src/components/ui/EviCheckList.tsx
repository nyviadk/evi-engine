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
  className?: string;
};

/**
 * EviCheckList — list-felt som "checkliste" med ét delt ikon (default check).
 * Tynd wrapper over [[EviIconList]]. Løser repeatable-i-repeatable (ét list-felt
 * frem for nested gruppe); et list-felt kan ikke bære ikon pr. række.
 */
export function EviCheckList({
  field,
  icon,
  linkResolver,
  className,
}: EviCheckListProps): React.ReactElement | null {
  if (!isFilled.richText(field)) return null;

  const iconName = isFilled.keyText(icon) ? icon : "check";
  // list-item → paragraph, så teksten render'es uden nested <ul><li>.
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
