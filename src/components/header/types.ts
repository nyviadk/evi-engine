import type { LinkResolverFunction } from "@prismicio/client";
import type { EviContext } from "@/src/lib/prismic/context";
import type { LanguageMap } from "@/src/lib/prismic/language-map";

/**
 * Context passed by <SliceZone> to every header slice component. Every future
 * header variant (HeaderClassic, HeaderCentered, ...) reads from the same
 * shape so slices remain interchangeable.
 *
 * Static fields (like `languageSelectorEnabled`) live on the parent navigation
 * document, not inside any slice — so switching between header variants keeps
 * these settings intact.
 */
export type EviHeaderSliceContext = {
  linkResolver: LinkResolverFunction;
  settings: EviContext["settings"];
  tenant: EviContext["tenant"];
  lang: EviContext["lang"];
  hostname: string;
  /** Precomputed root href respecting force_lang_prefix + default_locale. */
  homeHref: string;
  /** Current request pathname with locale prefix (from middleware header). */
  currentPathname: string;
  /** Static setting from navigation.data — applies to all header variants. */
  languageSelectorEnabled: boolean;
  /**
   * navigation.data.mobile_nav_breakpoint — hvornår nav'en folder fra hamburger
   * til inline række. Rå Prismic-label ("Kompakt"|"Standard"|"Bred"|"Meget
   * bred"); header-slicen mapper til et data-nav-bp-nøgle. undefined → Standard.
   */
  mobileNavBreakpoint?: string;
  /** Hele sitets sprogversioner pr. side; sprogvælgeren slår den aktuelle side op. */
  languages: LanguageMap;
};
