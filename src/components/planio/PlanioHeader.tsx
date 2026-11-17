import type { LinkResolverFunction, RichTextField } from "@prismicio/client";

import { EviStack } from "@/src/components/layout/EviStack";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { cn } from "@/src/lib/utils/cn";

export type PlanioHeaderProps = {
  /** Overskrift (heading2). */
  title: RichTextField;
  /** Brødtekst, vist i lead-størrelse. */
  description: RichTextField;
  linkResolver: LinkResolverFunction;
  isHero?: boolean;
  /** Markør inde i overskriften, fx tidslinjens stjerne; den placerer sig selv. */
  marker?: React.ReactNode;
  className?: string;
};

/** Planio-sektionernes overskrift + brødtekst i lead-størrelse, venstrestillet. */
export function PlanioHeader({
  title,
  description,
  linkResolver,
  isHero,
  marker,
  className,
}: PlanioHeaderProps): React.ReactElement | null {
  if (!has_rich_text(title, description)) return null;
  const Heading = isHero ? "h1" : "h2";

  return (
    <EviStack as="hgroup" gap="lg" className={cn("col-span-12", className)}>
      <EviRichText
        field={title}
        linkResolver={linkResolver}
        isHero={isHero}
        className="[&_h1]:max-w-[30ch] [&_h2]:max-w-[30ch]"
        extraComponents={
          marker
            ? {
                heading2: ({ children }) => (
                  <Heading className="relative">
                    {marker}
                    {children}
                  </Heading>
                ),
              }
            : undefined
        }
      />
      <EviRichText
        field={description}
        linkResolver={linkResolver}
        className="evi-lead max-w-prose"
      />
    </EviStack>
  );
}
