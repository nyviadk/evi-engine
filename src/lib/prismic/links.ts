import { isFilled, type LinkField } from "@prismicio/client";

/**
 * Et allowText-link er reelt "udfyldt" når BÅDE selve linket OG dets synlige
 * tekst er sat — et link uden label giver ingen knap/anchor at rendre. Samler
 * det gentagne `isFilled.link(x) && isFilled.keyText(x.text)`-mønster ét sted.
 */
export function is_link_filled(link: LinkField): boolean {
  return isFilled.link(link) && isFilled.keyText(link.text);
}

/** True hvis MINDST ét af linkene er udfyldt; links-tvillingen til has_rich_text. */
export function has_link(...links: LinkField[]): boolean {
  return links.some(is_link_filled);
}
