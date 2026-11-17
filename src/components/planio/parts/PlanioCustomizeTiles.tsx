import {
  isFilled,
  type Content,
  type LinkResolverFunction,
} from "@prismicio/client";

import { EviStack } from "@/src/components/layout/EviStack";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviIcon } from "@/src/components/ui/EviIcon";
import { PlanioEnergyBar } from "@/src/components/planio/PlanioEnergyBar";
import { PlanioSettingsCard } from "@/src/components/planio/PlanioSettingsCard";
import { PlanioSpoon } from "@/src/components/planio/PlanioSpoon";
import { has_rich_text } from "@/src/lib/prismic/fields";
import { cn } from "@/src/lib/utils/cn";

type Primary = Content.PlanioCustomizeSliceDefaultPrimary;
type TileProps = { p: Primary; linkResolver: LinkResolverFunction };

const UNITS = 5;

function Icons({ filled, icon }: { filled: number; icon: (className: string) => React.ReactNode }): React.ReactElement {
  return (
    // gap-0 + shrink-0: fem ikoner à 20px skal fylde kolonnen (6.5rem); med
    // EviStacks standard-gap blev de klemt til 8px brede.
    <EviStack direction="row" justify="between" className="gap-0">
      {Array.from({ length: UNITS }, (_, i) => (
        <span key={i} className="shrink-0">
          {icon(cn("size-5", i < filled ? "text-evi-accent" : "text-current/25"))}
        </span>
      ))}
    </EviStack>
  );
}

export function has_energy_units(p: Primary): boolean {
  return has_rich_text(p.unit_percent, p.unit_spoons, p.unit_bolts, p.unit_number);
}

/** Energien vist som procent, skeer, lyn og tal. Dekorativ; billedteksten forklarer. */
export function PlanioEnergyUnits({ p, linkResolver }: TileProps): React.ReactElement {
  const filled = isFilled.number(p.energy_level)
    ? Math.min(Math.max(Math.round(p.energy_level), 0), UNITS)
    : 0;
  const bar = <PlanioEnergyBar filled={filled} used={UNITS - filled} count={UNITS} size="sm" />;
  const rows = [
    { name: p.unit_percent, value: p.unit_percent_value, visual: bar },
    {
      name: p.unit_spoons,
      value: p.unit_spoons_value,
      visual: <Icons filled={filled} icon={(className) => <PlanioSpoon className={className} />} />,
    },
    {
      name: p.unit_bolts,
      value: p.unit_bolts_value,
      visual: (
        <Icons
          filled={filled}
          icon={(className) => <EviIcon name="ph:lightning-fill" className={className} />}
        />
      ),
    },
    { name: p.unit_number, value: p.unit_number_value, visual: bar },
  ].filter((row) => isFilled.richText(row.name));

  return (
    <ul>
      {rows.map((row, i) => (
        // Navnet over grafik + tal i alle rækker, så de ser ens ud i en smal flise.
        <EviStack
          key={i}
          as="li"
          gap="xs"
          className="border-t border-current/10 py-2 first:border-t-0"
        >
          <div className="min-w-0 text-sm font-semibold">
            <EviRichText.Raw field={row.name} linkResolver={linkResolver} />
          </div>
          <EviStack direction="row" align="center" justify="between" gap="md">
            <div className="w-26">{row.visual}</div>
            <div className="min-w-14 text-right text-lg font-bold whitespace-nowrap tabular-nums">
              {isFilled.keyText(row.value) ? row.value : null}
            </div>
          </EviStack>
        </EviStack>
      ))}
    </ul>
  );
}

export function has_day_settings(p: Primary): boolean {
  return (p.days_settings ?? []).some((row) => isFilled.richText(row.label));
}

/** Indstillinger for dage og uger. Dekorativ; skærmlæsere får days_label. */
export function PlanioDaySettings({ p, linkResolver }: TileProps): React.ReactElement {
  const rows = (p.days_settings ?? []).filter((row) => isFilled.richText(row.label));

  return (
    <PlanioSettingsCard>
      {rows.map((row, i) => (
        <PlanioSettingsCard.Row
          key={i}
          label={<EviRichText.Inline field={row.label} linkResolver={linkResolver} />}
          value={
            isFilled.richText(row.value) ? (
              <EviRichText.Inline field={row.value} linkResolver={linkResolver} />
            ) : undefined
          }
          swatch={isFilled.color(row.swatch) ? row.swatch : null}
          toggle={row.toggle === true}
        />
      ))}
    </PlanioSettingsCard>
  );
}
