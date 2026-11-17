"use client";

import { createContext, use, useId, useState } from "react";

import {
  hex_to_hsv,
  hsv_to_hex,
  parse_hex,
  type Hsv,
} from "@/src/components/planio/planio-color";
import { EviStack } from "@/src/components/layout/EviStack";
import { cn } from "@/src/lib/utils/cn";

export type PlanioColorRole = "primary" | "background" | "text";
export type PlanioPalette = Record<PlanioColorRole, string>;
export type PlanioPreset = { name: string; colors: PlanioPalette };

const ROLES: PlanioColorRole[] = ["primary", "background", "text"];
const STEP = 0.02;
const SHIFT_STEP = 0.1;
// Farvefeltet, skifte-knappen og tema-prikkerne har ingen global fokus-stil (inputs har).
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current";

type ColorsState = {
  colors: PlanioPalette;
  role: PlanioColorRole;
  hsv: Hsv;
  hexDraft: string | null;
  presets: PlanioPreset[];
  selectRole: (role: PlanioColorRole) => void;
  moveHsv: (next: Hsv) => void;
  typeHex: (value: string) => void;
  commitHex: () => void;
  applyPreset: (colors: PlanioPalette) => void;
  swap: () => void;
};

const ColorsContext = createContext<ColorsState | null>(null);

function useColors(): ColorsState {
  const state = use(ColorsContext);
  if (!state) throw new Error("PlanioColors-dele skal ligge inde i <PlanioColors>.");
  return state;
}

const clamp = (n: number): number => Math.min(1, Math.max(0, n));

function same_palette(a: PlanioPalette, b: PlanioPalette): boolean {
  return ROLES.every((role) => a[role].toUpperCase() === b[role].toUpperCase());
}

export type PlanioColorsProps = {
  /** Farverne man ser først. */
  start: PlanioPalette;
  presets: PlanioPreset[];
  children: React.ReactNode;
};

/**
 * Farvevælgeren i "Gør appen til din": vælg primær-, baggrunds- og tekstfarve
 * og se den lille onsdag skifte. Kun forhåndsvisningen skifter, ikke siden.
 * Holder kun farverne; al tekst renderes på serveren og sendes ind.
 */
export function PlanioColors({
  start,
  presets,
  children,
}: PlanioColorsProps): React.ReactElement {
  const [colors, setColors] = useState(start);
  const [role, setRole] = useState<PlanioColorRole>("primary");
  const [hsv, setHsv] = useState<Hsv>(() => hex_to_hsv(start.primary));
  const [hexDraft, setHexDraft] = useState<string | null>(null);

  const load = (next: PlanioPalette, next_role: PlanioColorRole): void => {
    setColors(next);
    setHsv((prev) => hex_to_hsv(next[next_role], prev.h));
    setHexDraft(null);
  };

  const state: ColorsState = {
    colors,
    role,
    hsv,
    hexDraft,
    presets,
    selectRole: (next_role) => {
      setRole(next_role);
      load(colors, next_role);
    },
    moveHsv: (next) => {
      setHsv(next);
      setColors((prev) => ({ ...prev, [role]: hsv_to_hex(next) }));
      setHexDraft(null);
    },
    typeHex: (value) => {
      setHexDraft(value);
      // Kun fulde 6-cifrede koder, så farven ikke springer, mens man skriver.
      const hex = /^#?[0-9a-f]{6}$/i.test(value.trim()) ? parse_hex(value) : null;
      if (!hex) return;
      setColors((prev) => ({ ...prev, [role]: hex }));
      setHsv((prev) => hex_to_hsv(hex, prev.h));
    },
    commitHex: () => setHexDraft(null),
    applyPreset: (next) => load(next, role),
    swap: () => load({ ...colors, background: colors.text, text: colors.background }, role),
  };

  return (
    <ColorsContext value={state}>
      <EviStack data-slot="planio-colors" gap="lg">
        {children}
      </EviStack>
    </ColorsContext>
  );
}

/**
 * Forhåndsvisningen. Sætter sidens farve-variabler lokalt, så Evi-klasser
 * indeni (bg-evi-primary, border-current …) bruger de valgte farver.
 */
export function PlanioColorsPreview({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}): React.ReactElement {
  const { colors } = useColors();
  const style: React.CSSProperties & Record<`--${string}`, string> = {
    "--color-primary": colors.primary,
    "--color-light": colors.background,
    "--color-dark": colors.text,
    backgroundColor: colors.background,
    color: colors.text,
  };

  return (
    <div
      aria-hidden
      data-slot="planio-colors-preview"
      className={cn("rounded-evi p-4", className)}
      style={style}
    >
      {children}
    </div>
  );
}

/** Hvilken farve man ændrer: tre radioknapper som piller med farveprøve. */
export function PlanioColorsRoles({
  legend,
  labels,
}: {
  legend: string | null;
  labels: Record<PlanioColorRole, string | null>;
}): React.ReactElement {
  const { role, colors, selectRole } = useColors();
  const name = useId();

  return (
    <EviStack as="fieldset" direction="row" wrap gap="xs" className="min-w-0">
      {legend && <legend className="sr-only">{legend}</legend>}
      {ROLES.filter((r) => labels[r]).map((r) => (
        <label
          key={r}
          className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full pr-3 pl-2 text-xs font-semibold ring-1 ring-current/25 ring-inset has-checked:font-bold has-checked:ring-2 has-checked:ring-current has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-current"
        >
          <input
            type="radio"
            name={name}
            value={r}
            checked={role === r}
            onChange={() => selectRole(r)}
            className="sr-only"
          />
          <span
            className="size-3.5 rounded-full ring-1 ring-current/30 ring-inset"
            style={{ backgroundColor: colors[r] }}
          />
          {labels[r]}
        </label>
      ))}
    </EviStack>
  );
}

/**
 * Farvefeltet: mætning vandret, lysstyrke lodret. Mus/touch og piletaster
 * (Shift = større skridt). Skærmlæsere hører den valgte farvekode.
 */
export function PlanioColorsArea({ label }: { label: string | null }): React.ReactElement {
  const { hsv, colors, role, moveHsv } = useColors();
  const hue = Math.round(hsv.h);

  const from_pointer = (event: React.PointerEvent<HTMLDivElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    moveHsv({
      h: hsv.h,
      s: clamp((event.clientX - rect.left) / rect.width),
      v: 1 - clamp((event.clientY - rect.top) / rect.height),
    });
  };

  const on_key = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    const step = event.shiftKey ? SHIFT_STEP : STEP;
    const moves: Record<string, ["s" | "v", number]> = {
      ArrowLeft: ["s", -step],
      ArrowRight: ["s", step],
      ArrowUp: ["v", step],
      ArrowDown: ["v", -step],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const [axis, delta] = move;
    moveHsv({ ...hsv, [axis]: clamp(hsv[axis] + delta) });
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label ?? undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(hsv.s * 100)}
      aria-valuetext={colors[role]}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        from_pointer(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) from_pointer(event);
      }}
      onKeyDown={on_key}
      className={cn("relative h-26 cursor-crosshair touch-none rounded-evi", FOCUS)}
      // Selve farverummet (sort/hvid/ren farvetone), ikke tema-farver.
      style={{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue} 100% 50%))`,
      }}
    >
      <span
        className="pointer-events-none absolute size-4 -translate-1/2 rounded-full border-2 border-evi-light ring-1 ring-evi-dark/25"
        style={{
          left: `${hsv.s * 100}%`,
          top: `${(1 - hsv.v) * 100}%`,
          backgroundColor: colors[role],
        }}
      />
    </div>
  );
}

/** Farvetone-skyderen (regnbuen). */
export function PlanioColorsHue({ label }: { label: string | null }): React.ReactElement {
  const { hsv, moveHsv } = useColors();
  const hue = Math.round(hsv.h);

  return (
    <input
      type="range"
      min={0}
      max={359}
      step={1}
      value={hue}
      aria-label={label ?? undefined}
      onChange={(event) => moveHsv({ ...hsv, h: Number(event.target.value) })}
      className={cn(
        // Regnbuen er farvetone-skalaen selv, ikke tema-farver.
        "h-6 w-full cursor-pointer appearance-none rounded-full bg-[linear-gradient(to_right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)] bg-size-[100%_12px] bg-center bg-no-repeat",
        "[&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-evi-light [&::-webkit-slider-thumb]:bg-(--thumb)",
        "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-evi-light [&::-moz-range-thumb]:bg-(--thumb) [&::-moz-range-track]:bg-transparent",
      )}
      style={{ "--thumb": `hsl(${hue} 100% 50%)` } as React.CSSProperties}
    />
  );
}

/** Farvekoden. 16px skrift, så iPhone ikke zoomer ind ved fokus. */
export function PlanioColorsHex({ label }: { label: string | null }): React.ReactElement {
  const { colors, role, hexDraft, typeHex, commitHex } = useColors();

  return (
    <input
      type="text"
      maxLength={7}
      spellCheck={false}
      autoComplete="off"
      aria-label={label ?? undefined}
      value={hexDraft ?? colors[role]}
      onChange={(event) => typeHex(event.target.value)}
      onBlur={commitHex}
      className="min-h-8 w-28 rounded-evi bg-transparent px-2.5 text-base font-semibold tracking-wide ring-1 ring-current/25 ring-inset"
    />
  );
}

/** Byt baggrund og tekst (lys ↔ mørk). */
export function PlanioColorsSwap({
  label,
  icon,
}: {
  label: string | null;
  icon?: React.ReactNode;
}): React.ReactElement | null {
  const { swap } = useColors();
  if (!label) return null;

  return (
    <button
      type="button"
      onClick={swap}
      className={cn(
        "inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full pr-3 pl-2 text-xs font-semibold ring-1 ring-current/25 ring-inset hover:bg-current/8",
        FOCUS,
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/** Genveje: færdige temaer som delte prikker (primær | baggrund). */
export function PlanioColorsPresets({
  label,
}: {
  label: React.ReactNode;
}): React.ReactElement | null {
  const { presets, colors, applyPreset } = useColors();
  const id = useId();
  if (presets.length === 0) return null;

  return (
    <EviStack direction="row" wrap align="center" gap="md" className="border-t border-current/10 pt-4">
      {label && (
        <span id={id} className="text-xs font-semibold">
          {label}
        </span>
      )}
      <EviStack
        role="group"
        aria-labelledby={label ? id : undefined}
        direction="row"
        wrap
        gap="xs"
      >
        {presets.map((preset, i) => (
          <button
            key={i}
            type="button"
            aria-label={preset.name}
            aria-pressed={same_palette(preset.colors, colors)}
            onClick={() => applyPreset(preset.colors)}
            className={cn(
              "size-6 cursor-pointer rounded-full ring-1 ring-current/20 ring-inset aria-pressed:outline-2 aria-pressed:outline-offset-2 aria-pressed:outline-current",
              FOCUS,
            )}
            style={{
              background: `linear-gradient(135deg, ${preset.colors.primary} 50%, ${preset.colors.background} 50%)`,
            }}
          />
        ))}
      </EviStack>
    </EviStack>
  );
}
