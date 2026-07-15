import {
  isFilled,
  type RichTextField,
  type LinkResolverFunction,
} from "@prismicio/client";
import { EviIcon } from "@/src/components/ui/EviIcon";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { cn } from "@/src/lib/utils/cn";

export type EviTagProps = {
  /** Iconify-navn (fx "ph:plant" / "lucide:leaf"). Tomt → intet ikon. */
  icon?: string | null;
  /** Tag-tekst (Prismic rich-text, single paragraph). Tomt → hele tag'et skjules. */
  text?: RichTextField | null;
  linkResolver: LinkResolverFunction;
  className?: string;
};

/**
 * Lille "chip" med valgfrit ikon + kort tekst — fx en tilgængeligheds- eller
 * kategori-label ("🌱 Klinik i Solbjerg & online"). Token-baseret pill der
 * følger sektionens tema (current-color). Teksten går gennem EviRichText (R2);
 * ikonet er dekorativt (EviIcon → aria-hidden uden aria-label), teksten bærer
 * betydningen.
 */
export function EviTag({
  icon,
  text,
  linkResolver,
  className,
}: EviTagProps): React.ReactElement | null {
  if (!isFilled.richText(text)) return null;

  return (
    <div
      data-slot="evi-tag"
      className={cn(
        // theme-primary-soft: blød brand-tint + kontrast-sikker tekst (self-
        // contained, uafhængig af sektionens tema). Ikke grå/neutral.
        "theme-primary-soft inline-flex w-fit items-center gap-2 rounded-full py-1.5 pr-4 pl-3 text-sm [&_p]:m-0",
        className,
      )}
    >
      {isFilled.keyText(icon) && (
        <EviIcon name={icon} className="size-4 text-evi-primary" />
      )}
      <EviRichText.Raw field={text} linkResolver={linkResolver} />
    </div>
  );
}
