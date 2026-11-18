import { Fragment } from "react";
import { isFilled, type Content, type LinkResolverFunction } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import Link from "next/link";

import { EviAutoGrid } from "@/src/components/layout/EviAutoGrid";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviTitle } from "@/src/components/typography/EviTitle";
import { evi_box_class, evi_card_bleed_class } from "@/src/components/ui/EviBox";
import { EviButton } from "@/src/components/ui/EviButton";
import { EviCard } from "@/src/components/ui/EviCard";
import { EviImage } from "@/src/components/ui/EviImage";
import { EviTag } from "@/src/components/ui/EviTag";
import { FeedFilter } from "@/src/components/feed/parts/FeedFilter";
import { FeedPost } from "@/src/components/feed/parts/FeedPost";
import { resolve_heading_align } from "@/src/lib/prismic/align";
import type { FeedPage } from "@/src/lib/prismic/feed";
import { has_rich_text, text_as_rich_text } from "@/src/lib/prismic/fields";
import { is_link_filled } from "@/src/lib/prismic/links";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { evi_card_body_class } from "@/src/lib/utils/card-text";
import { cn } from "@/src/lib/utils/cn";
import { long_date } from "@/src/lib/utils/date";

export type FeedDefaultLayoutProps = {
  slice: Content.FeedSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

/** Emnerne på tværs af kortene, de hyppigste først. */
function common_tags(items: { tags: string[] }[]): string[] {
  const count = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags) count.set(tag, (count.get(tag) ?? 0) + 1);
  }
  return [...count].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([tag]) => tag);
}

/**
 * Ét kort: billede, emne, titel, uddrag og en fod med dato og link. Lyst kort
 * med tynd kant; skyggen kommer først ved hover. Linket dækker hele kortet
 * (before:inset-0; pilen bruger ::after), så kortet er ét klik og ét tab-stop.
 * Søster-kort → EviCard, så titler, uddrag og fødder flugter.
 */
function FeedCard({
  page,
  cta,
  date,
  linkResolver,
}: {
  page: FeedPage;
  cta: string | null;
  date: string | null;
  linkResolver: LinkResolverFunction;
}): React.ReactElement {
  const topic = page.tags[0];
  return (
    <EviCard
      rows={5}
      className={cn(
        evi_box_class("outlined"),
        "overflow-hidden motion-safe:transition-shadow hover:shadow-evi",
      )}
    >
      {isFilled.image(page.image) ? (
        <EviImage
          field={page.image}
          aspectRatio="video"
          variant="plain"
          rounded={false}
          imageClassName="object-cover"
          sizes="(min-width: 1024px) 30vw, (min-width: 672px) 45vw, 92vw"
          className={evi_card_bleed_class("top")}
        />
      ) : (
        <div />
      )}
      {topic ? (
        <EviTag
          text={text_as_rich_text(topic, "paragraph")}
          linkResolver={linkResolver}
          className="mt-5 self-start justify-self-start"
        />
      ) : (
        <div />
      )}
      <EviTitle
        field={text_as_rich_text(page.title, "heading3")}
        linkResolver={linkResolver}
        size="lg"
        className="mt-3"
      />
      {page.description ? (
        <EviRichText
          field={text_as_rich_text(page.description, "paragraph")}
          linkResolver={linkResolver}
          className={cn("mt-2 text-current/75", evi_card_body_class())}
        />
      ) : (
        <div />
      )}
      <EviStack
        direction="row"
        wrap
        align="center"
        justify="between"
        gap="sm"
        className="mt-5 border-t border-current/10 pt-4 text-sm"
      >
        {date && (
          <time dateTime={page.date} className="text-current/75">
            {date}
          </time>
        )}
        <EviButton
          asChild
          variant="primary"
          appearance="text"
          size="sm"
          arrow
          className="before:absolute before:inset-0"
        >
          <Link href={page.href}>
            {cta ?? page.title}
            {cta && <span className="sr-only">: {page.title}</span>}
          </Link>
        </EviButton>
      </EviStack>
    </EviCard>
  );
}

/**
 * Feed "default": en sides undersider som kort, nyeste først. Uden valgt side
 * er det sidens egne undersider; siden selv er aldrig med. Kortene bygges af
 * hver sides SEO-titel, -beskrivelse og -billede; datoen er sidens "Dato" eller
 * Prismics første udgivelse. Filtrene er sidernes Prismic-tags.
 */
export function FeedDefaultLayout({
  slice,
  index,
  context,
}: FeedDefaultLayoutProps): React.ReactElement | null {
  const { linkResolver, pageId, feedPages = [], lang = "da-dk" } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(context, index);
  const p = slice.primary;

  const parentId = isFilled.contentRelationship(p.parent_page) ? p.parent_page.id : pageId;
  const cta = isFilled.keyText(p.card_cta) ? p.card_cta : null;

  // Undersider (artikler) og opslag i én tidslinje, nyeste først.
  const pageItems = feedPages
    .filter((page) => page.parentId === parentId && page.id !== pageId)
    .map((page) => ({
      key: page.id,
      date: page.date,
      tags: page.tags,
      node: (
        <FeedCard
          page={page}
          cta={cta}
          date={p.show_date ? long_date(page.date, lang) : null}
          linkResolver={linkResolver}
        />
      ),
    }));
  const source = parentId ? context.feedPosts?.[parentId] : undefined;
  const postItems = source
    ? (source.posts ?? []).flatMap((post, i) => {
        const date = post.date;
        if (!isFilled.date(date) || !has_rich_text(post.text)) return [];
        return [{
          key: `post-${i}`,
          date,
          tags: isFilled.keyText(post.topic) ? [post.topic] : [],
          node: <FeedPost post={post} date={long_date(date, lang)} source={source} linkResolver={linkResolver} />,
        }];
      })
    : [];
  const items = [...pageItems, ...postItems]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, isFilled.number(p.limit) && p.limit > 0 ? p.limit : undefined);
  if (items.length === 0 && !has_rich_text(p.heading, p.body)) return null;

  const tags = p.show_filters ? common_tags(items) : [];
  const filtered =
    tags.length > 1 && isFilled.keyText(p.filter_legend) && isFilled.keyText(p.filter_all);

  return (
    <EviSection theme={theme} hero={isHero} collapsePadding={collapsePadding} data-slot="feed">
      <EviHeadingGroup
        title={p.heading}
        description={p.body}
        linkResolver={linkResolver}
        isHero={isHero}
        align={resolve_heading_align(p.heading_align)}
      />
      {filtered ? (
        <FeedFilter
          legend={p.filter_legend ?? ""}
          allLabel={p.filter_all ?? ""}
          status={isFilled.keyText(p.filter_status) ? p.filter_status : null}
          tags={tags}
          items={items}
        />
      ) : (
        items.length > 0 && (
          <EviRow>
            <EviAutoGrid size="trio">{items.map((item) => <Fragment key={item.key}>{item.node}</Fragment>)}</EviAutoGrid>
          </EviRow>
        )
      )}
      {is_link_filled(p.cta_link) && (
        <EviRow className={cn(resolve_heading_align(p.heading_align) === "center" && "md:text-center")}>
          <EviButton asChild variant="primary" appearance="solid">
            <PrismicNextLink field={p.cta_link} linkResolver={linkResolver} />
          </EviButton>
        </EviRow>
      )}
    </EviSection>
  );
}
