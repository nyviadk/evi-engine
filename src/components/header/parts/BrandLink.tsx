import { isFilled, type ImageField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { EviBrandText } from "@/src/components/typography/EviBrandText";
import { cn } from "@/src/lib/utils/cn";

export type BrandLinkProps = {
  /** Optional logo image from the header slice. Falls back to siteName text if empty. */
  logo: ImageField;
  /** From settings.site_name — used as text fallback. */
  siteName: string | null | undefined;
  /** Absolute fallback if both logo and siteName are empty. */
  hostname: string;
  /** Precomputed href to site root, respecting force_lang_prefix + default_locale. */
  homeHref: string;
  /**
   * When false (default) sets translate="no" to prevent browser translators
   * (Google Translate) from mangling the brand. Tenant can opt in.
   */
  allowTranslation: boolean;
  /** Max image height in Tailwind class form (e.g., "h-8" or "h-10"). */
  imageHeightClass?: string;
  className?: string;
};

export function BrandLink({
  logo,
  siteName,
  hostname,
  homeHref,
  allowTranslation,
  imageHeightClass = "h-8",
  className,
}: BrandLinkProps): React.ReactElement {
  const brand_text =
    (isFilled.keyText(siteName) ? siteName : null) || hostname;
  const translate_attr = allowTranslation ? undefined : "no";
  const has_logo = isFilled.image(logo);

  return (
    <a
      href={homeHref}
      className={cn(
        "evi-nav-brand inline-flex items-center rounded-evi text-current no-underline hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
      aria-label={has_logo ? brand_text : undefined}
    >
      {has_logo ? (
        <PrismicNextImage
          field={logo}
          className={cn("w-auto object-contain", imageHeightClass)}
          fallbackAlt=""
          loading="eager"
          fetchPriority="high"
        />
      ) : (
        <EviBrandText text={brand_text} translate={translate_attr} />
      )}
    </a>
  );
}
