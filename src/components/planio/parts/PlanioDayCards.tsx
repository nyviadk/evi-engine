import {
  isFilled,
  type Content,
  type LinkResolverFunction,
} from "@prismicio/client";

import { EviStack } from "@/src/components/layout/EviStack";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviIconBadge } from "@/src/components/ui/EviIconBadge";
import { PlanioCard } from "@/src/components/planio/PlanioCard";
import {
  PlanioEnergyBar,
  energy_segments,
} from "@/src/components/planio/PlanioEnergyBar";
import { has_rich_text } from "@/src/lib/prismic/fields";

type Primary = Content.PlanioDaySliceDefaultPrimary;

export type PlanioDayCardProps = {
  p: Primary;
  linkResolver: LinkResolverFunction;
};

type Chip = { text: Primary["dialog_helps"][number]["text"]; selected?: boolean };

function ChipGroup({
  label,
  chips,
  linkResolver,
}: {
  label: Primary["dialog_helps_label"];
  chips: Chip[];
  linkResolver: LinkResolverFunction;
}): React.ReactElement | null {
  const filled = chips.filter((chip) => isFilled.richText(chip.text));
  if (filled.length === 0) return null;
  return (
    <EviStack gap="sm">
      <PlanioCard.Label field={label} linkResolver={linkResolver} />
      <PlanioCard.Chips>
        {filled.map((chip, i) => (
          <PlanioCard.Chip
            key={i}
            field={chip.text}
            selected={chip.selected === true}
            linkResolver={linkResolver}
          />
        ))}
      </PlanioCard.Chips>
    </EviStack>
  );
}

export function has_check_card(p: Primary): boolean {
  return (
    has_rich_text(p.check_card_title, p.check_result, p.check_says) ||
    (p.check_answers ?? []).length > 0
  );
}

/** PlanioCheck: tre svar og appens forslag til dagens energi. */
export function PlanioCheckCard({
  p,
  linkResolver,
}: PlanioDayCardProps): React.ReactElement {
  const answers = (p.check_answers ?? []).filter((answer) =>
    has_rich_text(answer.question, answer.answer),
  );
  const has_result =
    has_rich_text(p.check_result, p.check_says) || isFilled.number(p.check_energy);

  return (
    <PlanioCard>
      <PlanioCard.Label field={p.check_card_title} linkResolver={linkResolver} />
      {answers.length > 0 && (
        // ps-0: globals.css rykker lister i lister ind, og kortet står i tidslinjens <ol>.
        <dl className="ps-0 text-sm">
          {answers.map((answer, i) => (
            // wrap: er der ikke plads ved siden af spørgsmålet, lægger svaret
            // sig på linjen under (højrestillet) i stedet for at klemmes.
            <EviStack
              key={i}
              direction="row"
              wrap
              justify="between"
              gap="sm"
              className="border-b border-current/10 py-2.5 wrap-break-word hyphens-auto last:border-b-0"
            >
              <dt className="min-w-0 font-semibold text-pretty">
                <EviRichText.Inline field={answer.question} linkResolver={linkResolver} />
              </dt>
              <dd className="ml-auto min-w-0 text-right font-bold text-pretty">
                <EviRichText.Inline field={answer.answer} linkResolver={linkResolver} />
              </dd>
            </EviStack>
          ))}
        </dl>
      )}
      {has_result && (
        <PlanioCard.Section>
          <PlanioCard.Title field={p.check_result} linkResolver={linkResolver} />
          {isFilled.number(p.check_energy) && (
            <PlanioEnergyBar filled={energy_segments(p.check_energy)} size="sm" />
          )}
          {isFilled.richText(p.check_says) && (
            <div className="font-semibold">
              <EviRichText.Raw field={p.check_says} linkResolver={linkResolver} />
            </div>
          )}
        </PlanioCard.Section>
      )}
    </PlanioCard>
  );
}

export function has_dialog_card(p: Primary): boolean {
  return (
    has_rich_text(p.dialog_card_title, p.dialog_card_note, p.dialog_source_text) ||
    (p.dialog_helps ?? []).length > 0
  );
}

/** Dialogkortet, der er delt med holdet. */
export function PlanioDialogCard({
  p,
  linkResolver,
}: PlanioDayCardProps): React.ReactElement {
  return (
    <PlanioCard>
      <PlanioCard.FutureBadge field={p.dialog_badge} linkResolver={linkResolver} />
      {has_rich_text(p.dialog_card_title, p.dialog_card_note) && (
        <EviStack gap="xs">
          <PlanioCard.Title field={p.dialog_card_title} linkResolver={linkResolver} />
          <PlanioCard.Label field={p.dialog_card_note} linkResolver={linkResolver} />
        </EviStack>
      )}
      {has_rich_text(p.dialog_source_label, p.dialog_source_text) && (
        <PlanioCard.Section>
          <PlanioCard.Label field={p.dialog_source_label} linkResolver={linkResolver} />
          {isFilled.richText(p.dialog_source_text) && (
            <div className="font-bold">
              <EviRichText.Raw field={p.dialog_source_text} linkResolver={linkResolver} />
            </div>
          )}
        </PlanioCard.Section>
      )}
      <ChipGroup
        label={p.dialog_helps_label}
        chips={p.dialog_helps ?? []}
        linkResolver={linkResolver}
      />
    </PlanioCard>
  );
}

export function has_reflection_card(p: Primary): boolean {
  return (
    has_rich_text(p.reflect_card_label, p.reflect_question, p.reflect_result, p.reflect_note) ||
    (p.reflect_drains ?? []).length > 0 ||
    (p.reflect_gives ?? []).length > 0
  );
}

/** Refleksionen efter en aftale: hvad tog, hvad gav, og appens forslag. */
export function PlanioReflectionCard({
  p,
  linkResolver,
}: PlanioDayCardProps): React.ReactElement {
  return (
    <PlanioCard>
      <PlanioCard.Label field={p.reflect_card_label} linkResolver={linkResolver} />
      <PlanioCard.Title field={p.reflect_question} linkResolver={linkResolver} />
      <ChipGroup
        label={p.reflect_drains_label}
        chips={p.reflect_drains ?? []}
        linkResolver={linkResolver}
      />
      <ChipGroup
        label={p.reflect_gives_label}
        chips={p.reflect_gives ?? []}
        linkResolver={linkResolver}
      />
      {isFilled.richText(p.reflect_result) && (
        <PlanioCard.Section>
          <PlanioCard.Title field={p.reflect_result} linkResolver={linkResolver} />
        </PlanioCard.Section>
      )}
      {isFilled.richText(p.reflect_note) && (
        <EviStack gap="sm">
          <PlanioCard.FutureBadge field={p.reflect_note_badge} linkResolver={linkResolver} />
          <PlanioCard.Note field={p.reflect_note} linkResolver={linkResolver} />
        </EviStack>
      )}
    </PlanioCard>
  );
}

export function has_reminder_card(p: Primary): boolean {
  return (
    isFilled.richText(p.remind_card_title) || (p.remind_items ?? []).length > 0
  );
}

/** Faste påmindelser; den, der er "nu", står fremhævet. */
export function PlanioReminderCard({
  p,
  linkResolver,
}: PlanioDayCardProps): React.ReactElement {
  const items = (p.remind_items ?? []).filter((item) =>
    isFilled.richText(item.title),
  );

  return (
    <PlanioCard gap="sm">
      <PlanioCard.Label field={p.remind_card_title} linkResolver={linkResolver} />
      {items.length > 0 && (
        <ul className="ps-0">
          {items.map((item, i) => (
            <EviStack
              key={i}
              as="li"
              direction="row"
              align="center"
              gap="sm"
              className="border-t border-current/10 py-3 last:pb-0"
            >
              <EviIconBadge name="lucide:bell" tone={item.now ? "solid" : "surface"} />
              <div className="min-w-0 flex-1 wrap-break-word hyphens-auto">
                {/* "nu" står til højre for titlen og ryger under den, når der
                    ikke er plads, frem for at tage en kolonne fra teksten. */}
                <EviStack direction="row" wrap justify="between" align="center" gap="xs">
                  <div className="min-w-0 text-sm font-bold sm:text-base">
                    <EviRichText.Raw field={item.title} linkResolver={linkResolver} />
                  </div>
                  {item.now && isFilled.richText(p.remind_now_label) && (
                    <span className="theme-dark rounded-full px-2.5 py-0.5 text-xs font-bold">
                      <EviRichText.Inline field={p.remind_now_label} linkResolver={linkResolver} />
                    </span>
                  )}
                </EviStack>
                <div className="text-xs font-semibold">
                  <EviRichText.Raw field={item.schedule} linkResolver={linkResolver} />
                </div>
              </div>
            </EviStack>
          ))}
        </ul>
      )}
    </PlanioCard>
  );
}
