import {
  isFilled,
  type Content,
  type LinkResolverFunction,
  type NumberField,
} from "@prismicio/client";

import { EviRichText } from "@/src/components/typography/EviRichText";
import { PlanioCard } from "@/src/components/planio/PlanioCard";
import {
  PlanioDemo,
  PlanioDemoBattery,
  PlanioDemoDay,
  PlanioDemoItem,
  PlanioDemoList,
  PlanioDemoMeter,
  PlanioDemoStat,
  PlanioDemoStats,
  PlanioDemoStatus,
  PlanioDemoTomorrowNote,
  type PlanioDemoEvent,
} from "@/src/components/planio/PlanioDayDemo";

type Primary = Content.PlanioDaySliceDefaultPrimary;
type DayItem = Primary["plan_today_items"][number];

function percent(value: NumberField, min: number): number {
  return isFilled.number(value) ? Math.min(Math.max(value, min), 100) : 0;
}

function named_items(items: DayItem[] | undefined): DayItem[] {
  return (items ?? []).filter((item) => isFilled.keyText(item.title));
}

export function has_plan_demo(p: Primary): boolean {
  return (
    named_items(p.plan_today_items).length + named_items(p.plan_tomorrow_items).length > 0
  );
}

/** Demoen med tekst fra Prismic: tal, batteri, dagens og morgendagens liste, status. */
export function PlanioDayDemoPanel({
  p,
  linkResolver,
}: {
  p: Primary;
  linkResolver: LinkResolverFunction;
}): React.ReactElement {
  const days = [
    { id: "today", legend: p.plan_today_label, items: named_items(p.plan_today_items) },
    { id: "tomorrow", legend: p.plan_tomorrow_label, items: named_items(p.plan_tomorrow_items) },
  ].filter((day) => day.items.length > 0);

  const events: PlanioDemoEvent[] = days.flatMap((day) =>
    day.items.map((item, i) => ({
      key: `${day.id}-${i}`,
      energy: percent(item.energy, -100),
      tomorrow: day.id === "tomorrow",
      checked: item.checked === true,
    })),
  );

  return (
    <PlanioDemo start={percent(p.plan_start, 0)} events={events}>
      <PlanioDemoMeter>
        <PlanioDemoStats>
          <PlanioDemoStat
            kind="start"
            label={<EviRichText.Inline field={p.plan_energy_label} linkResolver={linkResolver} />}
          />
          <PlanioDemoStat
            kind="planned"
            label={<EviRichText.Inline field={p.plan_planned_label} linkResolver={linkResolver} />}
          />
          <PlanioDemoStat
            kind="left"
            label={<EviRichText.Inline field={p.plan_left_label} linkResolver={linkResolver} />}
          />
        </PlanioDemoStats>
        <PlanioDemoBattery />
      </PlanioDemoMeter>

      <PlanioDemoList>
        {days.map((day) => (
          <PlanioDemoDay
            key={day.id}
            legend={<EviRichText.Inline field={day.legend} linkResolver={linkResolver} />}
          >
            {day.items.map((item, i) => (
              <PlanioDemoItem
                key={i}
                eventKey={`${day.id}-${i}`}
                title={item.title ?? ""}
                time={item.time}
                energy={percent(item.energy, -100)}
              />
            ))}
          </PlanioDemoDay>
        ))}
      </PlanioDemoList>

      <PlanioDemoStatus
        templates={{
          start: p.plan_status_start,
          balance: p.plan_status_balance,
          over: p.plan_status_over,
          zero: p.plan_status_zero,
          short: p.plan_status_short,
        }}
      >
        {isFilled.richText(p.plan_note) && (
          <PlanioDemoTomorrowNote>
            <PlanioCard.FutureBadge field={p.plan_note_badge} linkResolver={linkResolver} />
            <EviRichText.Raw field={p.plan_note} linkResolver={linkResolver} />
          </PlanioDemoTomorrowNote>
        )}
      </PlanioDemoStatus>
    </PlanioDemo>
  );
}
