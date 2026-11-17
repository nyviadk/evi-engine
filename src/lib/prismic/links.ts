import { isFilled, type LinkField } from "@prismicio/client";

/**
 * Et allowText-link er reelt "udfyldt" når BÅDE selve linket OG dets synlige
 * tekst er sat — et link uden label giver ingen knap/anchor at rendre. Samler
 * det gentagne `isFilled.link(x) && isFilled.keyText(x.text)`-mønster ét sted.
 */
export function is_link_filled(link: LinkField): boolean {
  return isFilled.link(link) && isFilled.keyText(link.text);
}

/**
 * Andre sites og filer (http/https) åbner i ny fane; sitets egne sider, mailto
 * og tel gør ikke. Redaktørens eget valg i Prismic (link.target) går forud.
 */
export function new_tab_target(href: string | undefined): "_blank" | undefined {
  return href && /^https?:\/\//i.test(href) ? "_blank" : undefined;
}

/** True hvis MINDST ét af linkene er udfyldt; links-tvillingen til has_rich_text. */
export function has_link(...links: LinkField[]): boolean {
  return links.some(is_link_filled);
}
