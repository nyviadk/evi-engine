import {
  isFilled,
  type Content,
  type KeyTextField,
  type LinkResolverFunction,
  type RichTextField,
} from "@prismicio/client";

import { EviRow } from "@/src/components/layout/EviRow";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { evi_box_class } from "@/src/components/ui/EviBox";
import { PlanioTimeline } from "@/src/components/planio/PlanioTimeline";
import {
  PlanioCheckCard,
  PlanioDialogCard,
  PlanioReflectionCard,
  PlanioReminderCard,
  has_check_card,
  has_dialog_card,
  has_reflection_card,
  has_reminder_card,
} from "@/src/components/planio/parts/PlanioDayCards";
import {
  PlanioDayDemoPanel,
  has_plan_demo,
} from "@/src/components/planio/parts/PlanioDayDemoPanel";
import { has_rich_text } from "@/src/lib/prismic/fields";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { cn } from "@/src/lib/utils/cn";

/**
 * Rammen om et app-kort: EviBox-formen på Evis "Primær blød"-tema. Et theme-*
 * (ikke en surface-tint) sætter --theme-bg, som demoens sticky måler bruger.
 * Udfyldt label → rammen er ét billede for skærmlæsere.
 */
function Frame({
  label,
  children,
}: {
  label?: KeyTextField;
  children: React.ReactNode;
}): React.ReactElement {
  const described = isFilled.keyText(label);
  return (
    <div
      role={described ? "img" : undefined}
      aria-label={described ? label : undefined}
      className={cn("theme-primary-soft", evi_box_class("compact"))}
    >
      {children}
    </div>
  );
}

export type PlanioDayLayoutProps = {
  slice: Content.PlanioDaySliceDefault;
  index: number;
  context: EviPageSliceContext;
};

type MomentProps = {
  time: KeyTextField;
  title: RichTextField;
  body: RichTextField;
  linkResolver: LinkResolverFunction;
  /** Kortet ved siden af teksten (fra @3xl/section) eller under den. */
  card: React.ReactNode;
};

function MomentText({
  time,
  title,
  body,
  linkResolver,
}: Omit<MomentProps, "card">): React.ReactElement {
  return (
    <PlanioTimeline.Content>
      <EviStack gap="md">
        <PlanioTimeline.Title time={time} title={title} linkResolver={linkResolver} />
        <EviRichText field={body} linkResolver={linkResolver} className="max-w-prose" />
      </EviStack>
    </PlanioTimeline.Content>
  );
}

/** Et tidspunkt: tekst og kort i sektionens kolonner (50/50 som "Om os"). */
function Moment({ card, ...text }: MomentProps): React.ReactElement | null {
  if (!has_rich_text(text.title, text.body)) return null;
  return (
    <PlanioTimeline.Item>
      {card ? (
        <EviSplit preset="50-50" align="center">
          <MomentText {...text} />
          <PlanioTimeline.Aside>{card}</PlanioTimeline.Aside>
        </EviSplit>
      ) : (
        <EviRow>
          <MomentText {...text} />
        </EviRow>
      )}
    </PlanioTimeline.Item>
  );
}

/**
 * planio_day "default": en onsdag med My Planio som tidslinje. Fem faste
 * tidspunkter; demoen "Planlæg dagen" fylder hele sporet under sin tekst.
 */
export function PlanioDayLayout({
  slice,
  index,
  context,
}: PlanioDayLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(context, index);
  const p = slice.primary;

  const show_plan = has_rich_text(p.plan_title, p.plan_body);
  const has_moments =
    show_plan ||
    has_rich_text(
      p.check_title,
      p.check_body,
      p.dialog_title,
      p.dialog_body,
      p.reflect_title,
      p.reflect_body,
      p.remind_title,
      p.remind_body,
    );
  if (!has_rich_text(p.heading, p.body) && !has_moments) return null;

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="planio-day"
    >
      <PlanioTimeline>
        <PlanioTimeline.Header
          title={p.heading}
          description={p.body}
          linkResolver={linkResolver}
          isHero={isHero}
        />
        {has_moments && (
          <PlanioTimeline.List>
            <Moment
              time={p.check_time}
              title={p.check_title}
              body={p.check_body}
              linkResolver={linkResolver}
              card={
                has_check_card(p) && (
                  <Frame label={p.check_label}>
                    <PlanioCheckCard p={p} linkResolver={linkResolver} />
                  </Frame>
                )
              }
            />
            {show_plan && (
              <PlanioTimeline.Item>
                <EviRow>
                  <MomentText
                    time={p.plan_time}
                    title={p.plan_title}
                    body={p.plan_body}
                    linkResolver={linkResolver}
                  />
                </EviRow>
                {has_plan_demo(p) && (
                  <EviRow>
                    <PlanioTimeline.Content>
                      <Frame>
                        <PlanioDayDemoPanel p={p} linkResolver={linkResolver} />
                      </Frame>
                    </PlanioTimeline.Content>
                  </EviRow>
                )}
              </PlanioTimeline.Item>
            )}
            <Moment
              time={p.dialog_time}
              title={p.dialog_title}
              body={p.dialog_body}
              linkResolver={linkResolver}
              card={
                has_dialog_card(p) && (
                  <Frame label={p.dialog_label}>
                    <PlanioDialogCard p={p} linkResolver={linkResolver} />
                  </Frame>
                )
              }
            />
            <Moment
              time={p.reflect_time}
              title={p.reflect_title}
              body={p.reflect_body}
              linkResolver={linkResolver}
              card={
                has_reflection_card(p) && (
                  <Frame label={p.reflect_label}>
                    <PlanioReflectionCard p={p} linkResolver={linkResolver} />
                  </Frame>
                )
              }
            />
            <Moment
              time={p.remind_time}
              title={p.remind_title}
              body={p.remind_body}
              linkResolver={linkResolver}
              card={
                has_reminder_card(p) && (
                  <Frame label={p.remind_label}>
                    <PlanioReminderCard p={p} linkResolver={linkResolver} />
                  </Frame>
                )
              }
            />
          </PlanioTimeline.List>
        )}
      </PlanioTimeline>
    </EviSection>
  );
}
