import type { RichTextComponents } from "@prismicio/react";
import {
  isFilled,
  type RichTextField,
  type LinkResolverFunction,
} from "@prismicio/client";

import { EviIcon } from "@/src/components/ui/EviIcon";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { cn } from "@/src/lib/utils/cn";

export type EviCheckListProps = {
  /** Rich-text-felt tænkt som punktliste (kun list-item). Tomt → intet render. */
  field: RichTextField | null | undefined;
  /**
   * Iconify-navn pr. punkt (uden prefix = lucide, ligesom alle ikon-felter).
   * Tomt → "check". Ét ikon for hele listen — vores svar på at et list-felt ikke
   * kan bære ikon pr. række (repeatable-i-repeatable findes ikke).
   */
  icon?: string | null;
  linkResolver: LinkResolverFunction;
  /** Ekstra klasser på `<ul>`. */
  className?: string;
};

/**
 * EviCheckList — render et list-felt som en "checkliste": hvert punkt får et ikon
 * foran (default check). Løser repeatable-i-repeatable ved at bruge ét list-felt
 * frem for en nested gruppe.
 *
 * Robust mod Prismic: paragraph kan aldrig fjernes helt som base-blok (allow-listen
 * styrer kun FORMATER, ikke at man kan taste en almindelig linje). Derfor pakker vi
 * ALT i ét `<ul>` og behandler enhver blok — list-item OG en "stray" paragraph — som
 * ét check-punkt. Så outputtet er altid en konsistent, semantisk liste, uanset om
 * redaktøren huskede at bullette. Inline fed/kursiv/links arver fra EviRichText.
 */
export function EviCheckList({
  field,
  icon,
  linkResolver,
  className,
}: EviCheckListProps): React.ReactElement | null {
  if (!isFilled.richText(field)) return null;

  const iconName = isFilled.keyText(icon) ? icon : "check";

  const item = (children: React.ReactNode) => (
    <li className="flex items-start gap-2">
      <EviIcon
        name={iconName}
        className="mt-0.5 size-5 shrink-0 text-evi-primary"
      />
      <span className="min-w-0">{children}</span>
    </li>
  );

  // list/oList → fragment (ingen nested <ul>); punkterne lander i det ydre <ul>.
  // list-item, o-list-item OG paragraph → ét check-<li> hver.
  const passthrough: RichTextComponents = {
    list: ({ children }) => <>{children}</>,
    oList: ({ children }) => <>{children}</>,
    listItem: ({ children }) => item(children),
    oListItem: ({ children }) => item(children),
    paragraph: ({ children }) => item(children),
  };

  return (
    <ul data-slot="evi-check-list" className={cn("grid gap-2", className)}>
      <EviRichText.Raw
        field={field}
        linkResolver={linkResolver}
        extraComponents={passthrough}
      />
    </ul>
  );
}
