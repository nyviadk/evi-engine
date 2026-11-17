import { isFilled, type ImageField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { EviBrandText } from "@/src/components/typography/EviBrandText";
import { cn } from "@/src/lib/utils/cn";

export type BrandLinkProps = {
  /** Optional logo image from the header slice. Falls back to siteName text if empty. */
  logo?: ImageField;
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
  /**
   * Logo-højde som Tailwind-klasse. Bredden er ALTID `w-auto` + `object-contain`,
   * så tenantens aspect bevares — logo-feltet har derfor kun en HØJDE-constraint
   * (60px), ingen bredde. Responsiv streng er fint (fx "h-10 md:h-15" så
   * header'en ikke bliver for høj på mobil). @default "h-15" (60px)
   */
  imageHeightClass?: string;
  className?: string;
  /**
   * Eget brand-mærke i stedet for logo/sitenavn, fx en animation. Linket får
   * da sitenavnet som navn, så mærket selv kan være aria-hidden.
   */
  children?: React.ReactNode;
};

/** Brandets navn: sitenavnet, ellers hostnavnet. */
export function brand_text(
  siteName: string | null | undefined,
  hostname: string,
): string {
  return (isFilled.keyText(siteName) ? siteName : null) || hostname;
}

export function BrandLink({
  logo,
  siteName,
  hostname,
  homeHref,
  allowTranslation,
  imageHeightClass = "h-15",
  className,
  children,
}: BrandLinkProps): React.ReactElement {
  const name = brand_text(siteName, hostname);
  const translate_attr = allowTranslation ? undefined : "no";
  const has_logo = isFilled.image(logo);
  const has_mark = children != null;

  return (
    <a
      href={homeHref}
      className={cn(
        // w-fit: klik-fladen må aldrig være bredere end logoet/teksten. Uden den
        // strækkes <a>'et af align-items:stretch i en flex-col (fx footer'ens
        // EviStack), så hele kolonnen bliver klikbar.
        "evi-nav-brand inline-flex w-fit items-center rounded-evi text-current no-underline hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
      aria-label={has_mark || has_logo ? name : undefined}
    >
      {has_mark ? (
        children
      ) : has_logo ? (
        <PrismicNextImage
          field={logo}
          className={cn("w-auto object-contain", imageHeightClass)}
          fallbackAlt=""
          loading="eager"
          fetchPriority="high"
        />
      ) : (
        <EviBrandText text={name} translate={translate_attr} />
      )}
    </a>
  );
}
