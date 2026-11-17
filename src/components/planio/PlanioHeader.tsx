import type { LinkResolverFunction, RichTextField } from "@prismicio/client";

import { EviStack } from "@/src/components/layout/EviStack";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { has_rich_text } from "@/src/lib/prismic/fields";

export type PlanioHeaderProps = {
  /** Overskrift (heading2). */
  title: RichTextField;
  /** Brødtekst, vist i lead-størrelse. */
  description: RichTextField;
  linkResolver: LinkResolverFunction;
  isHero?: boolean;
};

/** Planio-sektionernes overskrift + brødtekst i lead-størrelse, venstrestillet. */
export function PlanioHeader({
  title,
  description,
  linkResolver,
  isHero,
}: PlanioHeaderProps): React.ReactElement | null {
  if (!has_rich_text(title, description)) return null;

  return (
    <EviStack as="hgroup" gap="lg" className="col-span-12">
      <EviRichText
        field={title}
        linkResolver={linkResolver}
        isHero={isHero}
        className="[&_h1]:max-w-[30ch] [&_h2]:max-w-[30ch]"
      />
      <EviRichText
        field={description}
        linkResolver={linkResolver}
        className="evi-lead max-w-prose"
      />
    </EviStack>
  );
}
