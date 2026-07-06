import type { LinkResolverFunction } from "@prismicio/client";
import type { EviContext } from "@/src/lib/prismic/context";

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
   * Precomputed URL for each tenant locale, correctly using each language's
   * own UID from Prismic alternate_languages. E.g. { "da-dk": "/da-dk/kontakt",
   * "en-eu": "/en-eu/contact" }. Locales without a translation fall back to
   * the language home ("/" for default without prefix, "/{locale}" otherwise).
   */
  languageUrls: Record<string, string>;
};
