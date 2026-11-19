import { isFilled, type RichTextField } from "@prismicio/client";

/**
 * True hvis MINDST ét af de givne rich-text-felter er udfyldt. Samler det
 * gentagne `isFilled.richText(a) || isFilled.richText(b)`-mønster fra
 * kort-/kasse-guards på tværs af slice-parts (cards, split, highlights, bento).
 */
/**
 * En almindelig tekst (fx en sides SEO-titel) som rich text, så den kan vises
 * gennem EviTitle/EviRichText som alt andet display-tekst (R2.1).
 */
export function text_as_rich_text(
  text: string,
  type: "heading2" | "heading3" | "paragraph",
): RichTextField {
  return [{ type, text, spans: [], direction: "ltr" }] as RichTextField;
}

export function has_rich_text(
  ...fields: (RichTextField | null | undefined)[]
): boolean {
  return fields.some((f) => isFilled.richText(f));
}
