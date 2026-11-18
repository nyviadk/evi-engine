import { isFilled, type Content } from "@prismicio/client";

import { EviRow } from "@/src/components/layout/EviRow";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviDivider } from "@/src/components/ui/EviDivider";
import { EviIcon } from "@/src/components/ui/EviIcon";
import { EviImage } from "@/src/components/ui/EviImage";
import { EviTag } from "@/src/components/ui/EviTag";
import { has_rich_text } from "@/src/lib/prismic/fields";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { long_date, short_date } from "@/src/lib/utils/date";

export type TextContentDocumentLayoutProps = {
  slice: Content.TextContentSliceDocument;
  index: number;
  context: EviPageSliceContext;
};

/**
 * TextContent "document": ét langt dokument, fx en artikel, en privatlivspolitik
 * eller vilkår. Mærkat, overskrift, intro og dato øverst, så et valgfrit billede;
 * teksten er sin egen række, så sektionens rytme adskiller den fra introen.
 * Teksten har egne overskrifter og lister og får ikke isHero (dens h2'er skal
 * blive h2'er). Domain-part (Tailwind tilladt, R3.3).
 */
export function TextContentDocumentLayout({
  slice,
  index,
  context,
}: TextContentDocumentLayoutProps): React.ReactElement | null {
  const { linkResolver, lastPublished, published, lang = "da-dk" } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  if (!has_rich_text(p.heading, p.body, p.content)) return null;

  // Nyheder viser udgivelsen, vilkår o.l. hvornår de sidst blev ændret.
  const date =
    p.date_display === "Skjul"
      ? null
      : p.date_display === "Udgivet"
        ? published && { value: published, icon: "lucide:calendar", text: long_date(published, lang) }
        : lastPublished && { value: lastPublished, icon: "lucide:pencil", text: short_date(lastPublished) };

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="text-content-document"
    >
      <EviRow>
        <EviStack gap="lg" align="start">
          <EviTag
            icon={p.tag_icon}
            text={p.tag_text}
            linkResolver={linkResolver}
          />
          <EviHeadingGroup
            title={p.heading}
            description={p.body}
            linkResolver={linkResolver}
            isHero={isHero}
          />
          {date && (
            <EviStack gap="sm" className="w-full max-w-prose">
              <EviDivider />
              <EviStack direction="row" gap="xs" align="center" className="text-sm">
                <EviIcon name={date.icon} className="size-3.5" />
                <time dateTime={date.value}>{date.text}</time>
              </EviStack>
            </EviStack>
          )}
        </EviStack>
      </EviRow>
      {isFilled.image(p.image) && (
        <EviRow>
          <EviImage
            field={p.image}
            variant="plain"
            sizes="(min-width: 768px) 65ch, 100vw"
            priority={isHero}
            className="shadow-evi max-w-prose"
          />
        </EviRow>
      )}
      {isFilled.richText(p.content) && (
        <EviRow>
          {/* Læsebredden kun på brødteksten: overskrifterne må bruge hele bredden. */}
          <EviRichText
            field={p.content}
            linkResolver={linkResolver}
            className="evi-prose-long [&>ol]:max-w-prose [&>p]:max-w-prose [&>ul]:max-w-prose"
          />
        </EviRow>
      )}
    </EviSection>
  );
}
