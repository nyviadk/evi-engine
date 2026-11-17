import { isFilled, type Content } from "@prismicio/client";

import { EviRow } from "@/src/components/layout/EviRow";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviDivider } from "@/src/components/ui/EviDivider";
import { EviIcon } from "@/src/components/ui/EviIcon";
import { EviTag } from "@/src/components/ui/EviTag";
import { has_rich_text } from "@/src/lib/prismic/fields";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

export type TextContentDocumentLayoutProps = {
  slice: Content.TextContentSliceDocument;
  index: number;
  context: EviPageSliceContext;
};

/** Prismic-dato ("2026-11-11") i kort dansk form: 11/11-2026. */
function short_date(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}/${month}-${year}`;
}

/**
 * TextContent "document": ét langt dokument i læsbar bredde, fx en
 * privatlivspolitik eller vilkår. Mærkat, overskrift, intro og dato øverst;
 * teksten er sin egen række, så sektionens rytme adskiller den fra introen.
 * Teksten har egne overskrifter og lister og får ikke isHero (dens h2'er skal
 * blive h2'er). Domain-part (Tailwind tilladt, R3.3).
 */
export function TextContentDocumentLayout({
  slice,
  index,
  context,
}: TextContentDocumentLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  if (!has_rich_text(p.heading, p.body, p.content)) return null;

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
          {isFilled.date(p.last_updated) && (
            <EviStack gap="sm" className="w-full max-w-prose">
              <EviDivider />
              <EviStack direction="row" gap="xs" align="center" className="text-sm">
                <EviIcon name="lucide:pencil" className="size-3.5" />
                <time dateTime={p.last_updated}>
                  {short_date(p.last_updated)}
                </time>
              </EviStack>
            </EviStack>
          )}
        </EviStack>
      </EviRow>
      {isFilled.richText(p.content) && (
        <EviRow>
          <EviRichText
            field={p.content}
            linkResolver={linkResolver}
            className="max-w-prose"
          />
        </EviRow>
      )}
    </EviSection>
  );
}
