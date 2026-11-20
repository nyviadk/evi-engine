import { isFilled, type Content } from "@prismicio/client";

import { EviRow } from "@/src/components/layout/EviRow";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviRichText } from "@/src/components/typography/EviRichText";
import {
  EviAccordion,
  EviAccordionItem,
} from "@/src/components/ui/EviAccordion";
import { EviImage } from "@/src/components/ui/EviImage";
import { EviVideo } from "@/src/components/ui/EviVideo";
import { system_copy } from "@/src/lib/i18n/system-pages";
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
 * Video "default": valgfri overskrift, en lydløs video i loop (16:9, og 9:16 på
 * mobil, hvis den findes) og videoens tekst bag en åbner. Domain-part
 * (Tailwind tilladt, R3.3).
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
          playLabel={copy.videoPlay}
          pauseLabel={copy.videoPause}
          className="mx-auto max-w-5xl"
        >
          <EviImage
            field={p.poster}
            mobileField={mobile ? p.poster_mobile : undefined}
            aspectRatio="video"
            mobileAspectRatio={mobile ? "portrait" : undefined}
            variant="plain"
            rounded={false}
            priority={eagerImages}
            sizes="(min-width: 1024px) 1024px, 100vw"
            imageClassName="object-cover"
          />
        </EviVideo>
      </EviRow>
      {isFilled.richText(p.transcript) && (
        <EviRow>
          <EviAccordion className="mx-auto max-w-5xl">
            <EviAccordionItem summary={copy.videoTranscript}>
              <EviRichText field={p.transcript} linkResolver={linkResolver} />
            </EviAccordionItem>
          </EviAccordion>
        </EviRow>
      )}
    </EviSection>
  );
}
