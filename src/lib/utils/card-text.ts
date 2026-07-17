import { cn } from "@/src/lib/utils/cn";

/**
 * Delt typografi-skala for titel/tekst inde i kort og kasser — samler de
 * `[&_h3]`/`[&_p]`-prose-overrides der før var kopieret i hver features-part
 * (bento, icon-bento, cards, split, highlights). Ét sted at justere hvordan
 * kort-tekst ser ud på tværs af design-systemet.
 */

export type EviCardTitleSize = "base" | "lg" | "xl";

const titleSize: Record<EviCardTitleSize, string> = {
  base: "[&_h3]:text-base",
  lg: "[&_h3]:text-lg",
  xl: "[&_h3]:text-xl",
};

/** h3-titel i et kort: nulstillet margin, semibold, tæt linjehøjde + valgt størrelse. */
export function evi_card_title_class(size: EviCardTitleSize = "lg"): string {
  return cn(
    "[&_h3]:m-0 [&_h3]:leading-snug [&_h3]:font-semibold",
    titleSize[size],
  );
}

/** Brødtekst i et kort når den er et SEPARAT element fra titlen (fx EviCard-rækker):
 *  nulstillet margin + lille størrelse; afstand til titlen styres af elementets `mt-*`. */
export function evi_card_body_class(): string {
  return "[&_p]:m-0 [&_p]:text-sm";
}

/** Kombineret titel+tekst i ÉN prose-wrapper (ikon-række-lister: split, highlights)
 *  — brødteksten er en `<p>` lige under `<h3>`, så den får top-margin i stedet. */
export function evi_list_text_class(): string {
  return cn(evi_card_title_class("base"), "[&_p]:mt-1 [&_p]:mb-0 [&_p]:text-sm");
}
