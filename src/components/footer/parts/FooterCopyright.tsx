import type { RichTextComponents } from "@prismicio/react";
import type { LinkResolverFunction, RichTextField } from "@prismicio/client";
import { EviRichText } from "@/src/components/typography/EviRichText";

export type FooterCopyrightProps = {
  /** Prismic RichText field with just the trailing text (e.g. "Firmanavn"). */
  field: RichTextField;
  linkResolver: LinkResolverFunction;
};

/**
 * Renders "© {current-year} {editor-content}". Year and © are code-generated
 * so the copyright can never go stale — editor only supplies the trailing
 * text, typically the rights-holder name.
 *
 * Delegates all rendering (evi-prose wrapper, hyperlink serializer,
 * heading-shifts) to EviRichText via the `extraComponents` prop. Only new
 * concept here: the paragraph override that prepends "© {year} ".
 */
export function FooterCopyright({
  field,
  linkResolver,
}: FooterCopyrightProps): React.ReactElement | null {
  const year = new Date().getFullYear();

  const extraComponents: RichTextComponents = {
    paragraph: ({ children }) => (
      <p>
        © {year} {children}
      </p>
    ),
  };

  return (
    <EviRichText
      field={field}
      linkResolver={linkResolver}
      extraComponents={extraComponents}
      data-slot="evi-footer-copyright"
    />
  );
}
