import {
  isFilled,
  type ColorField,
  type Content,
  type LinkResolverFunction,
} from "@prismicio/client";

import { EviStack } from "@/src/components/layout/EviStack";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviIcon } from "@/src/components/ui/EviIcon";
import {
  PlanioColors,
  PlanioColorsArea,
  PlanioColorsHex,
  PlanioColorsHue,
  PlanioColorsPresets,
  PlanioColorsPreview,
  PlanioColorsRoles,
  PlanioColorsSwap,
  type PlanioPalette,
  type PlanioPreset,
} from "@/src/components/planio/PlanioColors";
import {
  PLANIO_ENERGY_SEGMENTS,
  PlanioEnergyBar,
  energy_segments,
} from "@/src/components/planio/PlanioEnergyBar";
import { cn } from "@/src/lib/utils/cn";

type Primary = Content.PlanioCustomizeSliceDefaultPrimary;

function palette(primary: ColorField, background: ColorField, text: ColorField): PlanioPalette | null {
  if (!isFilled.color(primary) || !isFilled.color(background) || !isFilled.color(text)) {
    return null;
  }
  return {
    primary: primary.toUpperCase(),
    background: background.toUpperCase(),
    text: text.toUpperCase(),
  };
}

function presets_of(p: Primary): PlanioPreset[] {
  return (p.presets ?? []).flatMap((preset) => {
    const colors = palette(preset.primary, preset.background, preset.text);
    return colors && isFilled.keyText(preset.name) ? [{ name: preset.name, colors }] : [];
  });
}

/** Startfarverne, ellers det første tema. Uden farver er der intet at vise. */
export function start_palette(p: Primary): PlanioPalette | null {
  return palette(p.colors_primary, p.colors_background, p.colors_text) ?? presets_of(p)[0]?.colors ?? null;
}

/** Den lille onsdag, der skifter farve. */
function Preview({ p, linkResolver }: { p: Primary; linkResolver: LinkResolverFunction }): React.ReactElement {
  const items = (p.preview_items ?? []).filter((item) => isFilled.richText(item.title));
  const filled = isFilled.number(p.preview_energy) ? energy_segments(p.preview_energy) : 0;
  const used = isFilled.number(p.preview_energy_used)
    ? Math.min(energy_segments(p.preview_energy_used), PLANIO_ENERGY_SEGMENTS - filled)
    : 0;

  return (
    <EviStack gap="sm">
      <div className="text-xl leading-tight font-bold">
        <EviRichText.Raw field={p.preview_day} linkResolver={linkResolver} />
      </div>
      <div className="text-xs font-bold">
        <EviRichText.Raw field={p.preview_left} linkResolver={linkResolver} />
      </div>
      {isFilled.number(p.preview_energy) && (
        <PlanioEnergyBar filled={filled} used={used} size="sm" />
      )}
      {items.map((item, i) => (
        <EviStack
          key={i}
          direction="row"
          align="center"
          gap="sm"
          className="border-t border-current/12 pt-2 text-xs font-bold"
        >
          <span
            className={cn("h-4 w-0.75 shrink-0 rounded-full", !isFilled.color(item.color) && "bg-evi-primary")}
            style={isFilled.color(item.color) ? { backgroundColor: item.color } : undefined}
          />
          <div className="min-w-0">
            <EviRichText.Raw field={item.title} linkResolver={linkResolver} />
          </div>
        </EviStack>
      ))}
    </EviStack>
  );
}

/** Farve-flisen: forhåndsvisning + vælger, og temaerne under. */
export function PlanioCustomizeColors({
  p,
  linkResolver,
}: {
  p: Primary;
  linkResolver: LinkResolverFunction;
}): React.ReactElement | null {
  const start = start_palette(p);
  if (!start) return null;

  return (
    <PlanioColors start={start} presets={presets_of(p)}>
      <EviStack direction="row" wrap gap="lg">
        <PlanioColorsPreview className="grow basis-44 @lg/frame:max-w-64">
          <Preview p={p} linkResolver={linkResolver} />
        </PlanioColorsPreview>
        <EviStack gap="sm" className="grow basis-52">
          <PlanioColorsRoles
            legend={p.picker_legend}
            labels={{
              primary: p.picker_primary,
              background: p.picker_background,
              text: p.picker_text,
            }}
          />
          <PlanioColorsArea label={p.picker_area} />
          <PlanioColorsHue label={p.picker_hue} />
          <EviStack direction="row" wrap gap="sm">
            <PlanioColorsHex label={p.picker_hex} />
            <PlanioColorsSwap
              label={p.picker_swap}
              icon={<EviIcon name="lucide:sun-moon" className="size-4" />}
            />
          </EviStack>
        </EviStack>
      </EviStack>
      <PlanioColorsPresets
        label={
          isFilled.richText(p.presets_label) ? (
            <EviRichText.Inline field={p.presets_label} linkResolver={linkResolver} />
          ) : null
        }
      />
    </PlanioColors>
  );
}
