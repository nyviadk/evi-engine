import { isFilled, type RichTextField } from "@prismicio/client";

/**
 * True hvis MINDST ét af de givne rich-text-felter er udfyldt. Samler det
 * gentagne `isFilled.richText(a) || isFilled.richText(b)`-mønster fra
 * kort-/kasse-guards på tværs af slice-parts (cards, split, highlights, bento).
 */
export function has_rich_text(
  ...fields: (RichTextField | null | undefined)[]
): boolean {
  return fields.some((f) => isFilled.richText(f));
}
