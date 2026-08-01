import {
  isFilled,
  type RichTextField,
  type LinkResolverFunction,
} from "@prismicio/client";

import { EviRichText } from "@/src/components/typography/EviRichText";
import {
  evi_card_title_class,
  type EviCardTitleSize,
} from "@/src/lib/utils/card-text";
import { cn } from "@/src/lib/utils/cn";

export type EviTitleProps = {
  /** Prismic heading-felt (heading3/heading4). Tomt → intet render. */
  field: RichTextField | null | undefined;
  linkResolver: LinkResolverFunction;
  /** UI-størrelse til layout-titler (kort/boks/kolonne). @default "lg" */
  size?: EviCardTitleSize;
  /** Ekstra klasser på wrapper'en (fx spacing som `mt-4`). */
  className?: string;
};

/**
 * EviTitle — komponent-titel til layout-slots (kort-, boks-, kolonne-overskrift).
 * Render'er et heading-felt i UI-størrelse (`evi_card_title_class`) UDEN evi-prose,
 * så den slipper for at kæmpe mod prose'ens display-skala. Tommelfinger: EviRichText
 * (med evi-prose) til flydende brødtekst; EviTitle til korte titler i layout.
 */
export function EviTitle({
  field,
  linkResolver,
  size = "lg",
  className,
}: EviTitleProps): React.ReactElement | null {
  if (!isFilled.richText(field)) return null;

  return (
    <div data-slot="evi-title" className={cn(evi_card_title_class(size), className)}>
      <EviRichText.Raw field={field} linkResolver={linkResolver} />
    </div>
  );
}
