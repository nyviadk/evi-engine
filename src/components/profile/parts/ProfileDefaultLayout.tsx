import { isFilled, type Content } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviImage } from "@/src/components/ui/EviImage";
import { EviRichText } from "@/src/components/typography/EviRichText";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { has_rich_text } from "@/src/lib/prismic/fields";

export type ProfileDefaultLayoutProps = {
  slice: Content.ProfileSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

/**
 * Profile "default": rundt portræt (smal venstre-kolonne) + personlig hilsen th.
 * — beskrivelse, citat, uploadet signatur-billede og rolle. Signaturen vises via
 * et rå <img> (sandboxet, ingen fetch/inline → ingen XSS eller per-render CPU;
 * jf. SVG-beslutningen). Domain-part (Tailwind tilladt, R3.3).
 */
export function ProfileDefaultLayout({
  slice,
  index,
  context,
}: ProfileDefaultLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  const hasPortrait = isFilled.image(p.portrait);
  const hasSignature = isFilled.linkToMedia(p.signature);
  if (
    !hasPortrait &&
    !hasSignature &&
    !has_rich_text(p.description, p.quote, p.role)
  )
    return null;

  const content = (
    <EviStack gap="md">
      {isFilled.richText(p.description) && (
        <EviRichText
          field={p.description}
          linkResolver={linkResolver}
          className="[&_p]:text-lg [&_p]:leading-relaxed"
        />
      )}
      {isFilled.richText(p.quote) && (
        <EviRichText
          field={p.quote}
          linkResolver={linkResolver}
          className="[&_p]:m-0 [&_p]:text-xl"
        />
      )}
      {(hasSignature || isFilled.richText(p.role)) && (
        <div className="mt-2">
          {isFilled.linkToMedia(p.signature) && (
            // Rå <img>: signaturen er et Link-to-media (SVG). next/image tager en
            // ImageField og optimerer ikke vektor → et alm. <img> er rigtigt.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.signature.url}
              alt={p.signature_name ?? ""}
              className="h-14 w-auto"
            />
          )}
          {isFilled.richText(p.role) && (
            <EviRichText
              field={p.role}
              linkResolver={linkResolver}
              className="mt-2 [&_p]:m-0 [&_p]:text-sm"
            />
          )}
        </div>
      )}
    </EviStack>
  );

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="profile"
    >
      {hasPortrait ? (
        <EviSplit preset="25-75" align="center">
          {/* Cirklen cappes på mobil (fuld kolonne = kæmpe portræt), fylder den
              smalle kolonne på desktop. */}
          <div className="mx-auto w-40 sm:w-52 @3xl/section:mx-0 @3xl/section:w-full">
            <EviImage
              field={p.portrait}
              circle
              sizes="(min-width: 768px) 25vw, 45vw"
            />
          </div>
          {content}
        </EviSplit>
      ) : (
        // Uden portræt: ingen split — indholdet i én kolonne (samme tekstbredde).
        <div className="col-span-12 @3xl/section:col-span-9">{content}</div>
      )}
    </EviSection>
  );
}
