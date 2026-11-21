import { isFilled, type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { EviRow } from "@/src/components/layout/EviRow";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviButton } from "@/src/components/ui/EviButton";
import { EviImage } from "@/src/components/ui/EviImage";
import { EviVideo } from "@/src/components/ui/EviVideo";
import { system_copy } from "@/src/lib/i18n/system-pages";
import { is_link_filled } from "@/src/lib/prismic/links";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

export type VideoDefaultLayoutProps = {
  slice: Content.VideoSliceDefault;
  index: number;
  context: EviPageSliceContext;
};

/**
 * Video "default": valgfri overskrift, en lydløs video i loop (16:9, og 9:16
 * på mobil, hvis den findes) og en valgfri knap centreret under den.
 * Domain-part (Tailwind tilladt, R3.3).
 */
export function VideoDefaultLayout({
  slice,
  index,
  context,
}: VideoDefaultLayoutProps): React.ReactElement | null {
  const { linkResolver, lang } = context;
  const { theme, isHero, collapsePadding, eagerImages } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;
  if (!isFilled.linkToMedia(p.video)) return null;

  const copy = system_copy(lang);
  const mobile = isFilled.linkToMedia(p.video_mobile) ? p.video_mobile.url : null;

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="video"
    >
      <EviHeadingGroup
        title={p.heading}
        description={p.body}
        linkResolver={linkResolver}
        isHero={isHero}
        align="center"
      />
      <EviRow>
        <EviVideo
          src={p.video.url}
          mobileSrc={mobile}
          labels={{
            play: copy.videoPlay,
            pause: copy.videoPause,
            seek: copy.videoSeek,
            of: copy.videoOf,
          }}
          className="mx-auto max-w-6xl shadow-evi-lg"
        >
          <EviImage
            field={p.poster}
            mobileField={mobile ? p.poster_mobile : undefined}
            aspectRatio="video"
            mobileAspectRatio={mobile ? "portrait" : undefined}
            variant="plain"
            rounded={false}
            priority={eagerImages}
            sizes="(min-width: 1152px) 1152px, 100vw"
            imageClassName="object-cover"
          />
        </EviVideo>
      </EviRow>
      {is_link_filled(p.cta_link) && (
        <EviRow className="text-center">
          <EviButton asChild variant="primary" appearance="solid">
            <PrismicNextLink field={p.cta_link} linkResolver={linkResolver} />
          </EviButton>
        </EviRow>
      )}
      {/* Videoen har ingen lyd, så teksten er dens alternativ til skærmlæsere
          (WCAG 1.2.1). Synlig var den i vejen, så den er kun til dem. */}
      <EviRichText
        field={p.transcript}
        linkResolver={linkResolver}
        className="sr-only"
      />
    </EviSection>
  );
}
