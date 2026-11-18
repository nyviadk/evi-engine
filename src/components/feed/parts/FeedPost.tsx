import { asText, isFilled, type Content, type LinkResolverFunction } from "@prismicio/client";

import { EviStack } from "@/src/components/layout/EviStack";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { evi_box_class } from "@/src/components/ui/EviBox";
import { EVI_ROW_SPAN } from "@/src/components/ui/EviCard";
import { EviIcon } from "@/src/components/ui/EviIcon";
import { EviImage } from "@/src/components/ui/EviImage";
import { FeedPostText } from "@/src/components/feed/parts/FeedPostText";
import type { FeedPostSource } from "@/src/lib/prismic/feed";
import { cn } from "@/src/lib/utils/cn";
import { resolve_surface } from "@/src/lib/utils/surface";

type Post = Content.FeedSliceDefaultPrimaryPostsItem;

// Over ca. 7 linjer i et kort foldes teksten sammen.
const LONG_POST = 320;

/**
 * Et LinkedIn-opslag i feedet: læses færdigt her, uden egen underside. Et
 * `<blockquote>` med opslagets adresse i `cite` fortæller Google, at teksten er
 * citeret fra LinkedIn, og `data-nosnippet` holder den ude af sidens uddrag i
 * søgeresultaterne. En let tonet boks adskiller det fra artikelkortene. Spænder
 * over EviCard-rækkerne, så det kan stå i samme gitter som dem.
 */
export function FeedPost({
  post,
  date,
  source,
  linkResolver,
}: {
  post: Post;
  date: string;
  source: FeedPostSource;
  linkResolver: LinkResolverFunction;
}): React.ReactElement {
  const url = isFilled.link(post.url) && post.url.link_type === "Web" ? post.url.url : null;
  const long = asText(post.text).length > LONG_POST;
  const avatars = [source.author_image_1, source.author_image_2].filter((image) => isFilled.image(image));

  return (
    <blockquote
      cite={url ?? undefined}
      data-nosnippet
      className={cn(EVI_ROW_SPAN[5], "m-0 self-start", resolve_surface("Neutral"), evi_box_class("outlined"))}
    >
      <EviStack gap="md">
        <EviStack direction="row" align="center" justify="between" gap="sm">
          <EviStack direction="row" align="center" gap="sm">
            {avatars.length > 0 && (
              <EviStack direction="row" align="center" gap="xs">
                {avatars.map((image, i) => (
                  <EviImage
                    key={i}
                    field={image}
                    circle
                    sizes="40px"
                    className={cn("size-10 ring-2 ring-(--theme-bg)", i > 0 && "-ms-4")}
                  />
                ))}
              </EviStack>
            )}
            <EviStack gap="xs" className="text-sm leading-tight">
              {isFilled.keyText(source.author_name) && (
                <span className="font-semibold">{source.author_name}</span>
              )}
              <time dateTime={post.date ?? undefined} className="text-current/75">
                {date}
              </time>
            </EviStack>
          </EviStack>
          <EviIcon name="lucide:linkedin" aria-label="LinkedIn" className="size-5 shrink-0 text-current/60" />
        </EviStack>

        <FeedPostText more={long ? source.post_more : null} less={source.post_less}>
          <EviRichText
            field={post.text}
            linkResolver={linkResolver}
            className="[&_li]:text-sm [&_p]:mb-3 [&_p]:text-sm"
          />
        </FeedPostText>

        {isFilled.image(post.image) && (
          <EviImage
            field={post.image}
            aspectRatio="video"
            variant="plain"
            imageClassName="object-cover"
            sizes="(min-width: 1024px) 30vw, (min-width: 672px) 45vw, 92vw"
          />
        )}

        {url && isFilled.keyText(source.post_link_label) && (
          <footer className="border-t border-current/10 pt-3 text-sm">
            <a href={url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
              {source.post_link_label}
              <EviIcon name="lucide:arrow-up-right" className="ms-1 inline size-4 align-text-bottom" />
            </a>
          </footer>
        )}
      </EviStack>
    </blockquote>
  );
}
