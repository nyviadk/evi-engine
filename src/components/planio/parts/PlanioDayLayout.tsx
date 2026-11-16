import {
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
import { PlanioFrame } from "@/src/components/planio/PlanioFrame";
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
    <EviStack gap="md">
      <PlanioTimeline.Title time={time} title={title} linkResolver={linkResolver} />
      <EviRichText field={body} linkResolver={linkResolver} className="max-w-prose" />
    </EviStack>
  );
}

/** Et tidspunkt med tekst til venstre og kort til højre (40/60). */
function Moment({ card, ...text }: MomentProps): React.ReactElement | null {
  if (!has_rich_text(text.title, text.body)) return null;
  return (
    <PlanioTimeline.Item>
      {card ? (
        <EviSplit preset="40-60" align="center">
          <MomentText {...text} />
          {card}
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
 * tidspunkter; demoen "Planlæg dagen" fylder hele bredden under sin tekst.
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
                  <PlanioFrame label={p.check_label}>
                    <PlanioCheckCard p={p} linkResolver={linkResolver} />
                  </PlanioFrame>
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
                    <PlanioFrame>
                      <PlanioDayDemoPanel p={p} linkResolver={linkResolver} />
                    </PlanioFrame>
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
                  <PlanioFrame label={p.dialog_label}>
                    <PlanioDialogCard p={p} linkResolver={linkResolver} />
                  </PlanioFrame>
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
                  <PlanioFrame label={p.reflect_label}>
                    <PlanioReflectionCard p={p} linkResolver={linkResolver} />
                  </PlanioFrame>
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
                  <PlanioFrame label={p.remind_label}>
                    <PlanioReminderCard p={p} linkResolver={linkResolver} />
                  </PlanioFrame>
                )
              }
            />
          </PlanioTimeline.List>
        )}
      </PlanioTimeline>
    </EviSection>
  );
}
