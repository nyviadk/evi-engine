import { isFilled, type LinkField } from "@prismicio/client";

/**
 * Et allowText-link er reelt "udfyldt" når BÅDE selve linket OG dets synlige
 * tekst er sat — et link uden label giver ingen knap/anchor at rendre. Samler
 * det gentagne `isFilled.link(x) && isFilled.keyText(x.text)`-mønster ét sted.
 *
 * Kald direkte med feltet fra Prismic:
 *   if (!is_link_filled(cta_link)) return null;
 *   const has_cta = is_link_filled(p.cta_link);
 */
export function is_link_filled(link: LinkField): boolean {
  return isFilled.link(link) && isFilled.keyText(link.text);
}
