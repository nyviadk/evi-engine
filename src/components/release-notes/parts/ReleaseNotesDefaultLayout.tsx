import { isFilled, type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviAccordion, EviAccordionItem } from "@/src/components/ui/EviAccordion";
import { EviButton } from "@/src/components/ui/EviButton";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviRichText } from "@/src/components/typography/EviRichText";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { resolve_heading_align } from "@/src/lib/prismic/align";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { is_link_filled } from "@/src/lib/prismic/links";
import { long_date } from "@/src/lib/utils/date";
import { cn } from "@/src/lib/utils/cn";

export type ReleaseNotesDefaultLayoutProps = {
  slice: Content.ReleaseNotesSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

type Release = Content.ReleaseNotesSliceDefaultPrimaryReleasesItem;

/** Nyeste dato først; udgivelser uden dato bevarer deres rækkefølge til sidst. */
function newest_first(releases: Release[]): Release[] {
  return [...releases].sort((a, b) =>
    (b.release_date ?? "").localeCompare(a.release_date ?? ""),
  );
}

/**
 * ReleaseNotes "default": sektion-header + udgivelser som accordion (samme
 * `<details>`-liste som FAQ), nyeste øverst og åben. Version og dato står over
 * titlen; datoen skrives ud på sidens sprog. Valgfri knap under listen.
 * Domain-part (Tailwind tilladt, R3.3).
 */
export function ReleaseNotesDefaultLayout({
  slice,
  index,
  context,
}: ReleaseNotesDefaultLayoutProps): React.ReactElement | null {
  const { linkResolver, lang = "da-dk" } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  const releases = newest_first(
    (p.releases ?? []).filter((r) => has_rich_text(r.title, r.notes)),
  );
  const align = resolve_heading_align(p.heading_align);
  const has_cta = is_link_filled(p.cta_link);
  if (!has_rich_text(p.heading, p.body) && releases.length === 0) return null;

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="release-notes"
    >
      <EviHeadingGroup
        title={p.heading}
        description={p.body}
        linkResolver={linkResolver}
        isHero={isHero}
        align={align}
        mobileAlign="start"
      />
      {releases.length > 0 && (
        <EviRow>
          <EviAccordion
            className={cn("w-full max-w-3xl", align === "center" && "mx-auto")}
          >
            {releases.map((release, i) => {
              const version = isFilled.keyText(release.version)
                ? release.version
                : null;
              const date = isFilled.date(release.release_date)
                ? release.release_date
                : null;
              return (
                <EviAccordionItem
                  key={i}
                  open={i === 0}
                  summary={
                    <EviStack gap="xs">
                      {(version || date) && (
                        <span className="text-sm opacity-75">
                          {version}
                          {version && date && " · "}
                          {date && (
                            <time dateTime={date}>{long_date(date, lang)}</time>
                          )}
                        </span>
                      )}
                      <EviRichText
                        field={release.title}
                        linkResolver={linkResolver}
                        className="[&_h3]:m-0 [&_h3]:text-base [&_h3]:leading-snug [&_h3]:font-semibold md:[&_h3]:text-lg"
                      />
                    </EviStack>
                  }
                >
                  <EviRichText
                    field={release.notes}
                    linkResolver={linkResolver}
                    className="max-w-prose [&_p]:mt-0"
                  />
                </EviAccordionItem>
              );
            })}
          </EviAccordion>
        </EviRow>
      )}
      {has_cta && (
        <EviRow className={cn(align === "center" && "md:text-center")}>
          <EviButton asChild variant="primary" appearance="solid">
            <PrismicNextLink field={p.cta_link} linkResolver={linkResolver} />
          </EviButton>
        </EviRow>
      )}
    </EviSection>
  );
}
