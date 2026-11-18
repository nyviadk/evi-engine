import { isFilled, type Content, type ImageField } from "@prismicio/client";

import { resolve_page_url, type PathConfig } from "@/src/lib/prismic/paths";
import { local_date } from "@/src/lib/utils/date";

/** En side som kort i Feed-slicen. Data kommer fra sidens SEO-felter. */
export type FeedPage = {
  id: string;
  parentId: string | null;
  href: string;
  title: string;
  description: string | null;
  image: ImageField;
  /** "ÅÅÅÅ-MM-DD": sidens egen dato, ellers Prismics første udgivelse. */
  date: string;
  tags: string[];
};

type PageDoc = Pick<
  Content.PageDocument,
  "id" | "lang" | "tags" | "first_publication_date" | "data"
>;

/** Sidens dato: feltet "Dato" overskriver Prismics første udgivelse. */
export function page_date(doc: PageDoc, timeZone: string): string {
  const own = doc.data.publication_date;
  return isFilled.date(own) ? own : local_date(doc.first_publication_date, timeZone);
}

/** Alle sider på ét sprog som kort, nyeste først. */
export function build_feed_pages(
  docs: PageDoc[],
  lang: string,
  tree: Map<string, string[]>,
  config: PathConfig,
  timeZone: string,
): FeedPage[] {
  return docs
    .filter((doc) => doc.lang === lang && isFilled.keyText(doc.data.meta_title))
    .map((doc) => ({
      id: doc.id,
      parentId: isFilled.contentRelationship(doc.data.parent_page)
        ? doc.data.parent_page.id
        : null,
      href: resolve_page_url(doc.id, doc.lang, tree, config),
      title: doc.data.meta_title ?? "",
      description: isFilled.keyText(doc.data.meta_description)
        ? doc.data.meta_description
        : null,
      image: doc.data.meta_image,
      date: page_date(doc, timeZone),
      tags: doc.tags,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Opslagene i en Feed og det, de vises med (afsender og knaptekster). */
export type FeedPostSource = Pick<
  Content.FeedSliceDefaultPrimary,
  | "posts"
  | "author_name"
  | "author_image_1"
  | "author_image_2"
  | "post_more"
  | "post_less"
  | "post_link_label"
>;

/** Den første Feed på en side, der har opslag. */
export function post_source(
  slices: Content.PageDocument["data"]["slices"],
): FeedPostSource | null {
  for (const slice of slices) {
    if (slice.slice_type === "feed" && (slice.primary.posts ?? []).length > 0) return slice.primary;
  }
  return null;
}
