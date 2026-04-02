"use client";

import { useState, useEffect } from "react";
import { EviSection } from "@/src/components/EviSection";
import { EviButton } from "@/src/components/EviButton";
import { compute_slice_contexts } from "@/src/lib/slices";

// ── Client-side WCAG contrast (mirrors src/lib/colors.ts) ──

function hex_to_rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h[0]+h[0]+h[1]+h[1]+h[2]+h[2] : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function srgb_to_linear(c: number) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(r: number, g: number, b: number) {
  return 0.2126 * srgb_to_linear(r) + 0.7152 * srgb_to_linear(g) + 0.0722 * srgb_to_linear(b);
}

function wcag_ratio(l1: number, l2: number) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function contrast_color(surface: string, a: string, b: string) {
  const sl = luminance(...hex_to_rgb(surface));
  const ar = wcag_ratio(sl, luminance(...hex_to_rgb(a)));
  const br = wcag_ratio(sl, luminance(...hex_to_rgb(b)));
  return ar >= br ? a : b;
}

function mix_rgb(
  base: [number, number, number],
  overlay: [number, number, number],
  amount: number,
): [number, number, number] {
  return [
    Math.round(base[0] * (1 - amount) + overlay[0] * amount),
    Math.round(base[1] * (1 - amount) + overlay[1] * amount),
    Math.round(base[2] * (1 - amount) + overlay[2] * amount),
  ];
}

function rgb_to_hex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function apply_theme(light: string, dark: string, primary: string, secondary: string) {
  const vars: Record<string, string> = {
    "--color-light": light,
    "--color-dark": dark,
    "--color-primary": primary,
    "--color-secondary": secondary,
    "--text-on-light": contrast_color(light, dark, light),
    "--text-on-dark": contrast_color(dark, dark, light),
    "--text-on-primary": contrast_color(primary, dark, light),
    "--text-on-secondary": contrast_color(secondary, dark, light),
  };

  const light_rgb = hex_to_rgb(light);
  for (const [name, hex] of [["light", light], ["dark", dark], ["primary", primary], ["secondary", secondary]] as const) {
    const mixed = rgb_to_hex(...mix_rgb(light_rgb, hex_to_rgb(hex), 0.1));
    vars[`--text-on-${name}-soft`] = contrast_color(mixed, dark, light);
  }

  for (const [k, v] of Object.entries(vars)) {
    document.body.style.setProperty(k, v);
  }
}

// ── Fake slices ──

type FakeSlice = { primary: { theme: string } };

const fakeSlices: FakeSlice[] = [
  { primary: { theme: "light" } },
  { primary: { theme: "dark" } },
  { primary: { theme: "primary" } },
  { primary: { theme: "secondary" } },
  { primary: { theme: "light-soft" } },
  { primary: { theme: "dark-soft" } },
  { primary: { theme: "primary-soft" } },
  { primary: { theme: "secondary-soft" } },
  // Identical neighbors — test collapse
  { primary: { theme: "dark" } },
  { primary: { theme: "dark" } },
  { primary: { theme: "primary" } },
  { primary: { theme: "primary" } },
  { primary: { theme: "primary-soft" } },
  { primary: { theme: "primary-soft" } },
  // Mixed sequence
  { primary: { theme: "secondary" } },
  { primary: { theme: "light" } },
  { primary: { theme: "dark-soft" } },
  { primary: { theme: "secondary-soft" } },
  { primary: { theme: "light" } },
  { primary: { theme: "light" } },
  // Tint variants
  { primary: { theme: "primary-tint" } },
  { primary: { theme: "secondary-tint" } },
  // Tint neighbors — test collapse
  { primary: { theme: "primary-tint" } },
  { primary: { theme: "primary-tint" } },
];

// ── Component ──

export function EviTestBench() {
  const [light, setLight] = useState("#fafafa");
  const [dark, setDark] = useState("#302031");
  const [primary, setPrimary] = useState("#0c6170");
  const [secondary, setSecondary] = useState("#4d3b4d");

  const sliceContexts = compute_slice_contexts(fakeSlices, { light, dark, primary, secondary });

  useEffect(() => {
    apply_theme(light, dark, primary, secondary);
  }, [light, dark, primary, secondary]);

  return (
    <>
      {/* Floating color picker bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-6 px-4 py-3"
        style={{ background: "rgba(0,0,0,0.85)", color: "#fff", fontSize: 13 }}
      >
        <label className="flex items-center gap-2">
          Light
          <input type="color" value={light} onChange={(e) => setLight(e.target.value)} />
          <span className="font-mono text-xs opacity-60">{light}</span>
        </label>
        <label className="flex items-center gap-2">
          Dark
          <input type="color" value={dark} onChange={(e) => setDark(e.target.value)} />
          <span className="font-mono text-xs opacity-60">{dark}</span>
        </label>
        <label className="flex items-center gap-2">
          Primary
          <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
          <span className="font-mono text-xs opacity-60">{primary}</span>
        </label>
        <label className="flex items-center gap-2">
          Secondary
          <input type="color" value={secondary} onChange={(e) => setSecondary(e.target.value)} />
          <span className="font-mono text-xs opacity-60">{secondary}</span>
        </label>
      </div>

      {/* Spacer for fixed bar */}
      <div className="h-14" />

      {/* Sections */}
      {fakeSlices.map((_, index) => {
        const ctx = sliceContexts[index];
        return (
          <EviSection
            key={index}
            theme={ctx.theme}
            collapsePadding={ctx.collapsePadding}
          >
            <div className="mx-auto max-w-4xl px-6">
              <p className="text-sm font-mono opacity-50 mb-2">
                #{index + 1} — theme-{ctx.theme}
                {ctx.collapsePadding && " — pt collapsed (same as above)"}
              </p>
              <h2 className="text-2xl font-bold mb-3">
                Section med theme-{ctx.theme}
              </h2>
              <p className="mb-4 max-w-2xl">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div className="flex gap-3 flex-wrap mb-4">
                <EviButton variant="solid" size="sm">Solid</EviButton>
                <EviButton variant="outline" size="sm">Outline</EviButton>
                <EviButton variant="ghost" size="sm">Ghost</EviButton>
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="theme-surface-neutral rounded-lg p-4 flex-1 min-w-48">
                  <p className="text-sm font-semibold">surface-neutral</p>
                  <p className="text-sm opacity-70">8% currentColor</p>
                </div>
              </div>
            </div>
          </EviSection>
        );
      })}
    </>
  );
}
