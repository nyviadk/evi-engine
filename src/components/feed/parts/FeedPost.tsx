import { asText, isFilled, type Content, type ImageField, type LinkResolverFunction } from "@prismicio/client";

import { EviStack } from "@/src/components/layout/EviStack";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { evi_box_class } from "@/src/components/ui/EviBox";
import { EviButton } from "@/src/components/ui/EviButton";
import { EviCard } from "@/src/components/ui/EviCard";
import { EviIcon } from "@/src/components/ui/EviIcon";
import { EviImage } from "@/src/components/ui/EviImage";
import { FeedPostText } from "@/src/components/feed/parts/FeedPostText";
import type { FeedPostSource } from "@/src/lib/prismic/feed";
import { cn } from "@/src/lib/utils/cn";

type Post = Content.FeedSliceDefaultPrimaryPostsItem;

// Over ca. 7 linjer i et kort foldes teksten sammen.
const LONG_POST = 320;

type Avatar = { image: ImageField } | { initial: string };

/**
 * Afsenderens runde billeder; mangler et billede, står forbogstavet i stedet
 * ("Sebastian & Yannik" → S og Y). Højst to.
 */
function post_avatars(source: FeedPostSource): Avatar[] {
  const names = isFilled.keyText(source.author_name)
    ? source.author_name.split(/\s*(?:&|,|\bog\b|\band\b)\s*/i).filter(Boolean)
    : [];
  const images = [source.author_image_1, source.author_image_2];
  const count = Math.max(names.length, images.filter((image) => isFilled.image(image)).length);
  return Array.from({ length: Math.min(count, 2) }, (_, i): Avatar => {
    const image = images[i];
    return image && isFilled.image(image) ? { image } : { initial: (names[i] ?? "").charAt(0).toUpperCase() };
  }).filter((avatar) => "image" in avatar || avatar.initial);
}

function PostAvatar({ avatar, overlap }: { avatar: Avatar; overlap: boolean }): React.ReactElement {
  const shape = cn("size-9 ring-2 ring-(--theme-bg)", overlap && "-ms-2.5");
  if ("image" in avatar) {
    return <EviImage field={avatar.image} circle sizes="36px" className={shape} />;
  }
  return (
    <EviStack
      as="span"
      align="center"
      justify="center"
      className={cn(
        shape,
        "rounded-full text-sm font-bold text-evi-text-on-primary",
        overlap ? "bg-evi-primary/80" : "bg-evi-primary",
      )}
    >
      {avatar.initial}
    </EviStack>
  );
}

/**
 * Et LinkedIn-opslag i feedet: læses færdigt her, uden egen underside. Et
 * `<blockquote>` med opslagets adresse i `cite` fortæller Google, at teksten er
 * citeret fra LinkedIn, og `data-nosnippet` holder den ude af sidens uddrag i
 * søgeresultaterne. Samme rolige kort som artiklerne; afsender og LinkedIn-
 * mærket viser, at det er et opslag.
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
  const avatars = post_avatars(source);

  const link = url && isFilled.keyText(source.post_link_label) ? source.post_link_label : null;

  // Fire rækker (afsender, tekst, billede, fod), så søster-opslag deler spor og
  // kortene i en række bliver lige høje. En tom pladsholder-række ville opsuge
  // gitterets rækkeafstand og stå som et hul.
  return (
    <EviCard
      as="blockquote"
      rows={4}
      cite={url ?? undefined}
      data-nosnippet
      className={cn("m-0", evi_box_class("outlined"))}
    >
      <EviStack direction="row" align="center" justify="between" gap="sm">
        <EviStack direction="row" align="center" gap="sm">
          {avatars.length > 0 && (
            <EviStack direction="row" align="center" gap="xs" aria-hidden>
              {avatars.map((avatar, i) => (
                <PostAvatar key={i} avatar={avatar} overlap={i > 0} />
              ))}
            </EviStack>
          )}
          <EviStack gap="xs" className="gap-0.5 leading-tight">
            {isFilled.keyText(source.author_name) && (
              <span className="text-sm font-bold">{source.author_name}</span>
            )}
            <time dateTime={post.date ?? undefined} className="text-xs text-current/70">
              {date}
            </time>
          </EviStack>
        </EviStack>
        <EviIcon name="bi:linkedin" aria-label="LinkedIn" className="size-6 shrink-0 text-evi-primary" />
      </EviStack>

      <FeedPostText more={long ? source.post_more : null} less={source.post_less} className="mt-4">
        <EviRichText
          field={post.text}
          linkResolver={linkResolver}
          className="[&_li]:text-sm [&_p]:mb-3 [&_p]:text-sm"
        />
      </FeedPostText>

      {isFilled.image(post.image) ? (
        <EviImage
          field={post.image}
          aspectRatio="video"
          variant="plain"
          imageClassName="object-cover"
          sizes="(min-width: 1024px) 30vw, (min-width: 672px) 45vw, 92vw"
          className="mt-4"
        />
      ) : (
        <div />
      )}

      {link ? (
        <footer className="mt-5 self-end border-t border-current/10 pt-4">
          <EviButton asChild variant="primary" appearance="text" size="sm" arrow>
            <a href={url ?? undefined} target="_blank" rel="noopener noreferrer">
              {link}
            </a>
          </EviButton>
        </footer>
      ) : (
        <div />
      )}
    </EviCard>
  );
}
