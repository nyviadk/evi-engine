import {
  isFilled,
  type BooleanField,
  type KeyTextField,
  type LinkResolverFunction,
  type NumberField,
  type RichTextField,
} from "@prismicio/client";
import { CircleCheck } from "lucide-react";

import { EviStack } from "@/src/components/layout/EviStack";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { cn } from "@/src/lib/utils/cn";

const SEGMENTS = 10;

export type PlanioDayItem = {
  time: KeyTextField;
  title: RichTextField;
  change: KeyTextField;
  done: BooleanField;
};

export type PlanioDayScreenProps = {
  initials: KeyTextField;
  day: RichTextField;
  date: RichTextField;
  energy: RichTextField;
  /** Fyldte energifelter ud af 10. */
  energyLeft: NumberField;
  /** Grå (brugte) felter efter de fyldte. */
  energyUsed: NumberField;
  items: PlanioDayItem[];
  linkResolver: LinkResolverFunction;
};

function segment_count(value: NumberField, max: number): number {
  if (!isFilled.number(value)) return 0;
  return Math.min(Math.max(Math.round(value), 0), max);
}

/**
 * App-skærmen i My Planio-heroens telefon: dagens plan med energibar og
 * aftaler. Al tekst kommer fra Prismic; telefonen er dekorativ (aria-hidden),
 * og heroen beskriver den med en aria-label. Fast bredde (300px-telefon), så
 * px-størrelser holder proportionerne; mobil skaleres hele telefonen ned.
 */
export function PlanioDayScreen({
  initials,
  day,
  date,
  energy,
  energyLeft,
  energyUsed,
  items,
  linkResolver,
}: PlanioDayScreenProps): React.ReactElement {
  const left = segment_count(energyLeft, SEGMENTS);
  const used = segment_count(energyUsed, SEGMENTS - left);

  return (
    <div className="theme-light relative size-full px-4.5 pt-12">
      {isFilled.keyText(initials) && (
        <span className="absolute top-4.5 right-4.5 flex size-6.5 items-center justify-center rounded-full border border-evi-dark/25 text-[11px] leading-none font-bold">
          {initials}
        </span>
      )}
      <EviStack gap="md">
        <EviStack gap="xs">
          <div className="text-[22px] leading-tight font-bold">
            <EviRichText.Raw field={day} linkResolver={linkResolver} />
          </div>
          <div className="text-[11px] font-semibold">
            <EviRichText.Raw field={date} linkResolver={linkResolver} />
          </div>
        </EviStack>

        <EviStack gap="sm">
          <div className="text-[11px] font-bold">
            <EviRichText.Raw field={energy} linkResolver={linkResolver} />
          </div>
          <EviStack direction="row" gap="xs">
            {Array.from({ length: SEGMENTS }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-3.5 flex-1 rounded-sm",
                  i < left && "bg-evi-primary",
                  i >= left && i < left + used && "bg-evi-dark/15",
                  i >= left + used && "border border-dashed border-evi-dark/30",
                )}
              />
            ))}
          </EviStack>
        </EviStack>

        <ul>
          {items.map((item, i) => (
            <EviStack
              key={i}
              as="li"
              direction="row"
              align="center"
              gap="sm"
              className="border-t border-evi-dark/12 py-2.5"
            >
              <span className="w-0.75 self-stretch rounded-full bg-evi-primary" />
              <span className="w-9 text-[11px] font-semibold">
                {isFilled.keyText(item.time) ? item.time : null}
              </span>
              <div
                className={cn(
                  "flex-1 text-[13px] font-bold",
                  item.done && "line-through opacity-75",
                )}
              >
                <EviRichText.Raw field={item.title} linkResolver={linkResolver} />
              </div>
              {item.done ? (
                <CircleCheck className="size-4" />
              ) : (
                isFilled.keyText(item.change) && (
                  <span className="text-[11px] font-bold">{item.change}</span>
                )
              )}
            </EviStack>
          ))}
        </ul>
      </EviStack>
    </div>
  );
}
