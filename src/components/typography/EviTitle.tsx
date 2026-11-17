import {
  isFilled,
  type RichTextField,
  type LinkResolverFunction,
} from "@prismicio/client";
import { type RichTextComponents } from "@prismicio/react";

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
  /**
   * Markør forrest i titlen, fx en tidslinjes prik og klokkeslæt. Titlen er
   * `relative`, så markøren kan placere sig selv (fx `top-[0.5lh]` = første linje).
   */
  marker?: React.ReactNode;
};

function marker_headings(marker: React.ReactNode): RichTextComponents {
  return {
    heading3: ({ children }) => (
      <h3 className="relative">
        {marker}
        {children}
      </h3>
    ),
    heading4: ({ children }) => (
      <h4 className="relative">
        {marker}
        {children}
      </h4>
    ),
  };
}

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
  marker,
}: EviTitleProps): React.ReactElement | null {
  if (!isFilled.richText(field)) return null;

  return (
    <div data-slot="evi-title" className={cn(evi_card_title_class(size), className)}>
      <EviRichText.Raw
        field={field}
        linkResolver={linkResolver}
        extraComponents={marker ? marker_headings(marker) : undefined}
      />
    </div>
  );
}
