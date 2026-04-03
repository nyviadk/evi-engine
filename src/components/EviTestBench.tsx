"use client";

import { useState, useEffect } from "react";
import { EviSection } from "@/src/components/EviSection";
import { EviButton } from "@/src/components/EviButton";
import { compute_slice_contexts } from "@/src/lib/slices";

// ── Client-side WCAG contrast (mirrors src/lib/colors.ts) ──

function hex_to_rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
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
  return (
    0.2126 * srgb_to_linear(r) +
    0.7152 * srgb_to_linear(g) +
    0.0722 * srgb_to_linear(b)
  );
}

function contrast_ratio(l1: number, l2: number) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function contrast_color(surface: string, a: string, b: string) {
  const sl = luminance(...hex_to_rgb(surface));
  const ar = contrast_ratio(sl, luminance(...hex_to_rgb(a)));
  const br = contrast_ratio(sl, luminance(...hex_to_rgb(b)));
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

function compute_btn_on_section(
  btn_color: string,
  btn_text: string,
  section_bg: string,
  section_text: string,
): { bg: string; text: string; ink: string } {
  const ratio = contrast_ratio(
    luminance(...hex_to_rgb(btn_color)),
    luminance(...hex_to_rgb(section_bg)),
  );
  return {
    bg: ratio >= 1.5 ? btn_color : section_text,
    text: ratio >= 1.5 ? btn_text : section_bg,
    ink: ratio >= 4.5 ? btn_color : section_text,
  };
}

function apply_theme(
  light: string,
  dark: string,
  primary: string,
  secondary: string,
) {
  // Solid contrast
  const text_on_light = contrast_color(light, dark, light);
  const text_on_dark = contrast_color(dark, dark, light);
  const text_on_primary = contrast_color(primary, dark, light);
  const text_on_secondary = contrast_color(secondary, dark, light);

  // Soft contrast
  const light_rgb = hex_to_rgb(light);
  const soft_vars: Record<string, string> = {};
  for (const [name, hex] of [
    ["light", light],
    ["dark", dark],
    ["primary", primary],
    ["secondary", secondary],
  ] as const) {
    const mixed = rgb_to_hex(...mix_rgb(light_rgb, hex_to_rgb(hex), 0.1));
    soft_vars[`--text-on-${name}-soft`] = contrast_color(mixed, dark, light);
  }

  // Button safety vars
  const sections = [
    { name: "light", bg: light, text: text_on_light },
    { name: "dark", bg: dark, text: text_on_dark },
    { name: "primary", bg: primary, text: text_on_primary },
    { name: "secondary", bg: secondary, text: text_on_secondary },
  ];

  const btn_vars: Record<string, string> = {};
  for (const btn of [
    { name: "primary", color: primary, text: text_on_primary },
    { name: "secondary", color: secondary, text: text_on_secondary },
  ]) {
    for (const section of sections) {
      const result = compute_btn_on_section(
        btn.color,
        btn.text,
        section.bg,
        section.text,
      );
      btn_vars[`--btn-${btn.name}-bg-on-${section.name}`] = result.bg;
      btn_vars[`--btn-${btn.name}-text-on-${section.name}`] = result.text;
      btn_vars[`--btn-${btn.name}-ink-on-${section.name}`] = result.ink;
    }
  }

  const vars: Record<string, string> = {
    "--color-light": light,
    "--color-dark": dark,
    "--color-primary": primary,
    "--color-secondary": secondary,
    "--text-on-light": text_on_light,
    "--text-on-dark": text_on_dark,
    "--text-on-primary": text_on_primary,
    "--text-on-secondary": text_on_secondary,
    ...soft_vars,
    ...btn_vars,
  };

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
  { primary: { theme: "primary-soft" } },
  { primary: { theme: "secondary-soft" } },
  { primary: { theme: "primary-tint" } },
  { primary: { theme: "secondary-tint" } },
  { primary: { theme: "dark" } },
  { primary: { theme: "dark" } },
];

// ── Component ──

export function EviTestBench() {
  const [light, setLight] = useState("#fafafa");
  const [dark, setDark] = useState("#302031");
  const [primary, setPrimary] = useState("#0c6170");
  const [secondary, setSecondary] = useState("#4d3b4d");

  const sliceContexts = compute_slice_contexts(fakeSlices, {
    light,
    dark,
    primary,
    secondary,
  });

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
          <input
            type="color"
            value={light}
            onChange={(e) => setLight(e.target.value)}
          />
          <span className="font-mono text-xs opacity-60">{light}</span>
        </label>
        <label className="flex items-center gap-2">
          Dark
          <input
            type="color"
            value={dark}
            onChange={(e) => setDark(e.target.value)}
          />
          <span className="font-mono text-xs opacity-60">{dark}</span>
        </label>
        <label className="flex items-center gap-2">
          Primary
          <input
            type="color"
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
          />
          <span className="font-mono text-xs opacity-60">{primary}</span>
        </label>
        <label className="flex items-center gap-2">
          Secondary
          <input
            type="color"
            value={secondary}
            onChange={(e) => setSecondary(e.target.value)}
          />
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
              {/* ── Typography demo (evi-prose) ── */}
              <div className="evi-prose max-w-prose mb-8">
                <h1>Heading 1 — theme-{ctx.theme}</h1>
                <p>
                  Denne tekst demonstrerer det fulde typografi-system.
                  Brødteksten bruger 16px / 1rem med en linjehøjde på 1.5 (24px
                  rytme-enhed). Her er et{" "}
                  <a href="#">inline link med underline</a> der reagerer på
                  hover.
                </p>
                <h2>Heading 2 — sektion</h2>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco.
                </p>
                <h3>Heading 3 — underoverskrift</h3>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur.{" "}
                  <strong>Fed tekst</strong> og
                  <em>kursiv tekst</em> fungerer også.
                </p>
                <ul>
                  <li>Første punkt i en uordnet liste</li>
                  <li>Andet punkt med lidt mere tekst for at vise spacing</li>
                  <li>Tredje punkt</li>
                </ul>
                <h4>Heading 4 — detalje</h4>
                <p>
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa
                  qui officia deserunt mollit anim id est laborum.
                </p>
                <h5>Heading 5 — label</h5>
                <p>
                  Mindre overskrift til indlejrede sektioner og sidebar-indhold.
                </p>
                <h6>Heading 6 — mikro</h6>
                <p>
                  Den mindste overskrift, brugt til meta-information og
                  kategorier.
                </p>
                <ol>
                  <li>Første nummererede punkt</li>
                  <li>Andet nummererede punkt</li>
                </ol>
                <blockquote>
                  <p>
                    Et blockquote demonstrerer den tykke venstre border med
                    korrekt padding og vertikal rytme.
                  </p>
                </blockquote>
              </div>

              {/* ── Button grid: 3 variants × 3 appearances × 3 sizes ── */}
              <div className="space-y-4 mb-4">
                {(["primary", "secondary", "neutral"] as const).map(
                  (variant) => (
                    <div key={variant} className="space-y-2">
                      <p className="text-xs font-mono opacity-40 uppercase">
                        {variant}
                      </p>
                      {(["sm", "md", "lg"] as const).map((size) => (
                        <div
                          key={size}
                          className="flex items-center gap-4 flex-wrap"
                        >
                          <span className="text-xs font-mono opacity-40 w-8">
                            {size}
                          </span>
                          <EviButton
                            variant={variant}
                            appearance="solid"
                            size={size}
                          >
                            Solid
                          </EviButton>
                          <EviButton
                            variant={variant}
                            appearance="outline"
                            size={size}
                          >
                            Outline
                          </EviButton>
                          <EviButton
                            variant={variant}
                            appearance="text"
                            size={size}
                          >
                            Tekst
                          </EviButton>
                          <EviButton
                            variant={variant}
                            appearance="text"
                            size={size}
                            arrow
                          >
                            Se alle
                          </EviButton>
                        </div>
                      ))}
                    </div>
                  ),
                )}
              </div>
            </div>
          </EviSection>
        );
      })}
    </>
  );
}
