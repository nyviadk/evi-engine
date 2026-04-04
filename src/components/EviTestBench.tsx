"use client";

import { useState, useEffect } from "react";
import { EviSection } from "@/src/components/EviSection";
import { EviButton } from "@/src/components/EviButton";
import { EviSplit } from "@/src/components/EviSplit";
import { EviAutoGrid } from "@/src/components/EviAutoGrid";
import { EviCard } from "@/src/components/EviCard";
import { EviStack } from "@/src/components/EviStack";
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

// Grid demo section themes — used with compute_slice_contexts for collapsePadding
const gridDemoThemes: string[] = [
  // A. EviSplit — alle 5 presets
  "light",
  "light",
  "light",
  "light",
  "light",
  // B. EviSplit — 4 align varianter
  "dark",
  "dark",
  "dark",
  "dark",
  // C. Realistisk slice
  "primary",
  // D. EviAutoGrid — 3 sizes
  "light",
  "dark",
  "secondary",
  // E. EviCard varianter
  "light",
  "primary-soft",
  "dark",
  "secondary-soft",
  // F. Nesting
  "primary",
  "light",
  "dark",
  // G. Split på soft/tint temaer
  "primary-soft",
  "secondary-soft",
  "primary-tint",
  "secondary-tint",
  // H. Full composition
  "light",
];
const gridDemoSlices: FakeSlice[] = gridDemoThemes.map((t) => ({
  primary: { theme: t },
}));

// ── Component ──

export function EviTestBench() {
  const [light, setLight] = useState("#fafafa");
  const [dark, setDark] = useState("#302031");
  const [primary, setPrimary] = useState("#0c6170");
  const [secondary, setSecondary] = useState("#4d3b4d");

  const colors = { light, dark, primary, secondary };
  const sliceContexts = compute_slice_contexts(fakeSlices, colors);
  const gridContexts = compute_slice_contexts(gridDemoSlices, colors);

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

      {/* Theme sections — typography + buttons */}
      {fakeSlices.map((_, index) => {
        const ctx = sliceContexts[index];
        return (
          <EviSection
            key={index}
            theme={ctx.theme}
            collapsePadding={ctx.collapsePadding}
          >
            <p className="col-span-12 text-sm font-mono opacity-50 mb-2">
              #{index + 1} — theme-{ctx.theme}
              {ctx.collapsePadding && " — pt collapsed (same as above)"}
            </p>
            {/* ── Typography demo (evi-prose) ── */}
            <div className="col-span-12 evi-prose max-w-prose mb-8">
              <h1>Heading 1 — theme-{ctx.theme}</h1>
              <p>
                Denne tekst demonstrerer det fulde typografi-system. Brødteksten
                bruger 16px / 1rem med en linjehøjde på 1.5 (24px rytme-enhed).
                Her er et <a href="#">inline link med underline</a> der reagerer
                på hover.
              </p>
              <h2>Heading 2 — sektion</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco.
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
            <EviStack gap="lg" className="col-span-12 mb-4">
              {(["primary", "secondary", "neutral"] as const).map((variant) => (
                <EviStack key={variant} gap="sm">
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
                </EviStack>
              ))}
            </EviStack>
          </EviSection>
        );
      })}

      {/* ═══════════════════════════════════════════════════════
           GRID SYSTEM DEMOS — with collapsePadding
           ═══════════════════════════════════════════════════════ */}
      {(() => {
        // Index offsets into gridContexts for each section group
        // A: 0-4, B: 5-8, C: 9, D: 10-12, E: 13-16, F: 17-19, G: 20-23, H: 24
        const g = gridContexts;
        const presets = ["50-50", "60-40", "40-60", "33-67", "67-33"] as const;
        const aligns = ["start", "center", "end", "stretch"] as const;
        const softTintThemes = [
          "primary-soft",
          "secondary-soft",
          "primary-tint",
          "secondary-tint",
        ] as const;

        return (
          <>
            {/* ── A. EviSplit — alle 5 presets ── */}
            {presets.map((preset, i) => (
              <EviSection
                key={`split-${preset}`}
                theme={g[i].theme}
                collapsePadding={g[i].collapsePadding}
              >
                <p className="col-span-12 text-sm font-mono opacity-50">
                  A. EviSplit preset=&quot;{preset}&quot;
                  {g[i].collapsePadding && " — pt collapsed"}
                </p>
                <EviSplit preset={preset}>
                  <div className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-6">
                    <p className="text-sm font-mono opacity-60 mb-2">
                      Venstre ({preset.split("-")[0]}%)
                    </p>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam, quis nostrud
                      exercitation.
                    </p>
                  </div>
                  <div className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-6">
                    <p className="text-sm font-mono opacity-60 mb-2">
                      Højre ({preset.split("-")[1]}%)
                    </p>
                    <p>Kort tekst til sammenligning.</p>
                  </div>
                </EviSplit>
              </EviSection>
            ))}

            {/* ── B. EviSplit — 4 align varianter ── */}
            {aligns.map((align, i) => (
              <EviSection
                key={`align-${align}`}
                theme={g[5 + i].theme}
                collapsePadding={g[5 + i].collapsePadding}
              >
                <p className="col-span-12 text-sm font-mono opacity-50">
                  B. EviSplit preset=&quot;60-40&quot; align=&quot;{align}&quot;
                  {g[5 + i].collapsePadding && " — pt collapsed"}
                </p>
                <EviSplit preset="60-40" align={align}>
                  <div className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-6">
                    <p className="text-sm font-mono opacity-60 mb-2">
                      Venstre — lang tekst
                    </p>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                      ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p className="mt-3">
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                  </div>
                  <div className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-6">
                    <p className="text-sm font-mono opacity-60 mb-2">
                      Højre — kort
                    </p>
                    <p>Kort indhold.</p>
                  </div>
                </EviSplit>
              </EviSection>
            ))}

            {/* ── C. Realistisk slice ── */}
            <EviSection
              theme={g[9].theme}
              collapsePadding={g[9].collapsePadding}
            >
              <p className="col-span-12 text-sm font-mono opacity-50">
                C. EviSplit 50-50 — prose venstre, knapper højre (realistisk
                slice)
              </p>
              <EviSplit preset="50-50" align="center">
                <div className="evi-prose">
                  <h2>Vores mission</h2>
                  <p>
                    Vi bygger værktøjer der gør det nemt for små virksomheder at
                    se professionelle ud online. Ingen kode, ingen besvær.
                  </p>
                </div>
                <EviStack gap="md">
                  <EviButton variant="primary" appearance="solid" size="lg">
                    Kom i gang
                  </EviButton>
                  <EviButton variant="secondary" appearance="outline" size="lg">
                    Læs mere
                  </EviButton>
                </EviStack>
              </EviSplit>
            </EviSection>

            {/* ── D. EviAutoGrid — alle 3 sizes ── */}
            <EviSection
              theme={g[10].theme}
              collapsePadding={g[10].collapsePadding}
            >
              <p className="col-span-12 text-sm font-mono opacity-50">
                D. EviAutoGrid size=&quot;sm&quot; — 8 items (logos/tags)
              </p>
              <EviAutoGrid size="sm">
                {Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-4 text-center"
                  >
                    <div className="h-12 w-12 mx-auto rounded bg-[color-mix(in_oklch,currentColor_12%,transparent)]" />
                    <p className="text-xs font-mono opacity-60 mt-2">
                      Logo {i + 1}
                    </p>
                  </div>
                ))}
              </EviAutoGrid>
            </EviSection>

            <EviSection
              theme={g[11].theme}
              collapsePadding={g[11].collapsePadding}
            >
              <p className="col-span-12 text-sm font-mono opacity-50">
                D. EviAutoGrid size=&quot;md&quot; — 7 items (standard cards,
                wrapping test)
              </p>
              <EviAutoGrid size="md">
                {Array.from({ length: 7 }, (_, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-6"
                  >
                    <div className="h-32 rounded bg-[color-mix(in_oklch,currentColor_12%,transparent)] mb-3" />
                    <p className="font-semibold">Feature {i + 1}</p>
                    <p className="text-sm opacity-70 mt-1">
                      Kort beskrivelse af denne feature.
                    </p>
                  </div>
                ))}
              </EviAutoGrid>
            </EviSection>

            <EviSection
              theme={g[12].theme}
              collapsePadding={g[12].collapsePadding}
            >
              <p className="col-span-12 text-sm font-mono opacity-50">
                D. EviAutoGrid size=&quot;lg&quot; — 3 items (pricing cards)
              </p>
              <EviAutoGrid size="lg">
                {["Basis", "Pro", "Enterprise"].map((name, i) => (
                  <EviCard
                    key={i}
                    rows={4}
                    className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-8 text-center"
                  >
                    <p className="text-xs font-mono opacity-50 uppercase tracking-wider">
                      {name}
                    </p>
                    <p className="text-4xl font-bold mt-2">{(i + 1) * 99} kr</p>
                    <p className="text-sm opacity-70 mt-1">per måned</p>
                    <div className="mt-6">
                      <EviButton
                        variant="primary"
                        appearance={i === 1 ? "solid" : "outline"}
                        size="md"
                      >
                        Vælg {name}
                      </EviButton>
                    </div>
                  </EviCard>
                ))}
              </EviAutoGrid>
            </EviSection>

            {/* ── E. EviCard — subgrid row alignment ── */}
            <EviSection
              theme={g[13].theme}
              collapsePadding={g[13].collapsePadding}
            >
              <p className="col-span-12 text-sm font-mono opacity-50">
                E. EviCard rows=4 — titler med forskellig længde
              </p>
              <EviAutoGrid size="md">
                {[
                  { title: "Kort titel", desc: "Kort beskrivelse." },
                  {
                    title:
                      "En meget længere titel der fylder flere linjer for at teste subgrid row alignment",
                    desc: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
                  },
                  {
                    title: "Medium titel her",
                    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                  },
                  {
                    title: "Kort",
                    desc: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
                  },
                  {
                    title: "Femte kort — wrapping",
                    desc: "Dette kort wrapper til en ny række.",
                  },
                ].map((item, i) => (
                  <EviCard
                    key={i}
                    rows={4}
                    className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-4"
                  >
                    <div className="h-24 rounded bg-[color-mix(in_oklch,currentColor_12%,transparent)]" />
                    <h3 className="text-lg font-semibold mt-3">{item.title}</h3>
                    <p className="text-sm opacity-70 mt-1">{item.desc}</p>
                    <div className="mt-3">
                      <EviButton variant="primary" appearance="solid" size="sm">
                        Læs mere
                      </EviButton>
                    </div>
                  </EviCard>
                ))}
              </EviAutoGrid>
            </EviSection>

            <EviSection
              theme={g[14].theme}
              collapsePadding={g[14].collapsePadding}
            >
              <p className="col-span-12 text-sm font-mono opacity-50">
                E. EviCard rows=3 — kun titel + beskrivelse + CTA
              </p>
              <EviAutoGrid size="md">
                {[
                  {
                    title: "Webdesign",
                    desc: "Vi designer responsive websites der ser professionelle ud på alle enheder.",
                  },
                  { title: "SEO & Synlighed", desc: "Kort." },
                  {
                    title: "Hosting & Support",
                    desc: "Vi håndterer alt det tekniske så du kan fokusere på din forretning. 24/7 support inkluderet.",
                  },
                  {
                    title: "E-mail Marketing Automation",
                    desc: "Automatisér dine kampagner og nå dine kunder på det rigtige tidspunkt med det rigtige budskab.",
                  },
                ].map((item, i) => (
                  <EviCard
                    key={i}
                    rows={3}
                    className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-6"
                  >
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm opacity-70 mt-1">{item.desc}</p>
                    <div className="mt-4">
                      <EviButton
                        variant="primary"
                        appearance="text"
                        size="sm"
                        arrow
                      >
                        Læs mere
                      </EviButton>
                    </div>
                  </EviCard>
                ))}
              </EviAutoGrid>
            </EviSection>

            <EviSection
              theme={g[15].theme}
              collapsePadding={g[15].collapsePadding}
            >
              <p className="col-span-12 text-sm font-mono opacity-50">
                E. EviCard rows=2 — minimal (kun titel + beskrivelse)
              </p>
              <EviAutoGrid size="sm">
                {[
                  { title: "Hastighed", desc: "Under 1 sekund load time." },
                  {
                    title: "Sikkerhed",
                    desc: "SSL, firewall og daglige backups er standard.",
                  },
                  {
                    title: "Skalerbarhed",
                    desc: "Fra 100 til 100.000 besøgende.",
                  },
                  {
                    title: "Oppetid",
                    desc: "99.9% garanteret oppetid med automatisk failover og redundans i flere datacentre.",
                  },
                  { title: "API", desc: "RESTful API til alle integrationer." },
                  { title: "Analytics", desc: "Real-time data." },
                ].map((item, i) => (
                  <EviCard
                    key={i}
                    rows={2}
                    className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-4"
                  >
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm opacity-70 mt-1">{item.desc}</p>
                  </EviCard>
                ))}
              </EviAutoGrid>
            </EviSection>

            <EviSection
              theme={g[16].theme}
              collapsePadding={g[16].collapsePadding}
            >
              <p className="col-span-12 text-sm font-mono opacity-50">
                E. EviCard rows=4 — tomt beskrivelse-felt (empty wrapper keeps
                alignment)
              </p>
              <EviAutoGrid size="lg">
                {[
                  {
                    title: "Med beskrivelse",
                    desc: "Denne har en beskrivelse som fylder plads.",
                  },
                  { title: "Uden beskrivelse", desc: "" },
                  {
                    title: "Også med beskrivelse",
                    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit seddo.",
                  },
                ].map((item, i) => (
                  <EviCard
                    key={i}
                    rows={4}
                    className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-6"
                  >
                    <div className="h-20 rounded bg-[color-mix(in_oklch,currentColor_12%,transparent)]" />
                    <h3 className="text-lg font-semibold mt-3">{item.title}</h3>
                    <div>
                      {item.desc && (
                        <p className="text-sm opacity-70 mt-1">{item.desc}</p>
                      )}
                    </div>
                    <div className="mt-3">
                      <EviButton
                        variant="secondary"
                        appearance="solid"
                        size="sm"
                      >
                        Handling
                      </EviButton>
                    </div>
                  </EviCard>
                ))}
              </EviAutoGrid>
            </EviSection>

            {/* ── F. Nesting — EviAutoGrid inde i EviSplit ── */}
            <EviSection
              theme={g[17].theme}
              collapsePadding={g[17].collapsePadding}
            >
              <p className="col-span-12 text-sm font-mono opacity-50">
                F. Nested: EviSplit 67-33 → EviAutoGrid size=&quot;sm&quot; i
                67%-pane
              </p>
              <EviSplit preset="67-33">
                <div>
                  <p className="text-sm font-mono opacity-60 mb-4">
                    67% pane — AutoGrid reagerer på sin egen bredde
                  </p>
                  <EviAutoGrid size="sm">
                    {Array.from({ length: 6 }, (_, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-4 text-center"
                      >
                        <p className="text-sm font-mono opacity-60">
                          Item {i + 1}
                        </p>
                      </div>
                    ))}
                  </EviAutoGrid>
                </div>
                <div className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-6">
                  <p className="text-sm font-mono opacity-60 mb-2">
                    33% sidebar
                  </p>
                  <p>
                    AutoGrid i venstre pane reagerer på sin egen bredde, ikke
                    sektionens.
                  </p>
                </div>
              </EviSplit>
            </EviSection>

            <EviSection
              theme={g[18].theme}
              collapsePadding={g[18].collapsePadding}
            >
              <p className="col-span-12 text-sm font-mono opacity-50">
                F. Nested: EviSplit 33-67 → EviAutoGrid size=&quot;md&quot; +
                EviCard i 67%-pane
              </p>
              <EviSplit preset="33-67">
                <div className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-6">
                  <p className="text-sm font-mono opacity-60 mb-2">
                    33% sidebar
                  </p>
                  <p>Navigation, filtre, eller andet smalt indhold.</p>
                </div>
                <div>
                  <EviAutoGrid size="md">
                    {[
                      { title: "Kort A", desc: "Beskrivelse af kort A." },
                      {
                        title: "Kort B med længere titel",
                        desc: "Mere tekst her.",
                      },
                      { title: "Kort C", desc: "Endnu en beskrivelse." },
                      { title: "Kort D", desc: "Sidste kort i 67%-pane." },
                    ].map((item, i) => (
                      <EviCard
                        key={i}
                        rows={3}
                        className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-4"
                      >
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-sm opacity-70 mt-1">{item.desc}</p>
                        <div className="mt-2">
                          <EviButton
                            variant="primary"
                            appearance="text"
                            size="sm"
                            arrow
                          >
                            Se mere
                          </EviButton>
                        </div>
                      </EviCard>
                    ))}
                  </EviAutoGrid>
                </div>
              </EviSplit>
            </EviSection>

            <EviSection
              theme={g[19].theme}
              collapsePadding={g[19].collapsePadding}
            >
              <p className="col-span-12 text-sm font-mono opacity-50">
                F. Stress test: EviSplit 67-33 → EviAutoGrid size=&quot;md&quot;
                i 33%-pane (smal!)
              </p>
              <EviSplit preset="67-33">
                <div className="evi-prose">
                  <h2>Hovedindhold</h2>
                  <p>
                    Den brede pane har prose-tekst. Den smalle 33%-pane til
                    højre har et AutoGrid, der burde falde til 1 kolonne fordi
                    der kun er ~400px tilgængeligt.
                  </p>
                </div>
                <div>
                  <EviAutoGrid size="md">
                    {Array.from({ length: 3 }, (_, i) => (
                      <EviCard
                        key={i}
                        rows={2}
                        className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-4"
                      >
                        <p className="font-semibold">Card {i + 1}</p>
                        <p className="text-sm opacity-70 mt-1">
                          Skal stå i 1 kolonne.
                        </p>
                      </EviCard>
                    ))}
                  </EviAutoGrid>
                </div>
              </EviSplit>
            </EviSection>

            {/* ── G. EviSplit på soft/tint temaer ── */}
            {softTintThemes.map((theme, i) => (
              <EviSection
                key={`split-theme-${theme}`}
                theme={g[20 + i].theme}
                collapsePadding={g[20 + i].collapsePadding}
              >
                <p className="col-span-12 text-sm font-mono opacity-50">
                  G. EviSplit 60-40 på theme-{theme}
                  {g[20 + i].collapsePadding && " — pt collapsed"}
                </p>
                <EviSplit preset="60-40" align="center">
                  <div className="evi-prose">
                    <h3>Overskrift på {theme}</h3>
                    <p>
                      Tekst og knapper skal have korrekt kontrast uanset
                      baggrundstema.
                    </p>
                    <EviButton variant="primary" appearance="solid" size="md">
                      Primær solid
                    </EviButton>
                  </div>
                  <div className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-6">
                    <p className="text-sm opacity-70">
                      Højre kolonne med surface-neutral baggrund.
                    </p>
                    <div className="mt-3">
                      <EviButton
                        variant="secondary"
                        appearance="outline"
                        size="sm"
                      >
                        Sekundær outline
                      </EviButton>
                    </div>
                  </div>
                </EviSplit>
              </EviSection>
            ))}

            {/* ── H. Full composition — intro + split + cards i samme sektion ── */}
            <EviSection
              theme={g[24].theme}
              collapsePadding={g[24].collapsePadding}
            >
              <div className="col-span-12 evi-prose max-w-prose">
                <h2>H. Full composition — flere blokke i én sektion</h2>
                <p>
                  Denne sektion demonstrerer gap-y mellem stakkede children:
                  først prose, så et split, og til sidst et card-grid. Alt med
                  automatisk vertikal afstand via EviSections gap-y.
                </p>
              </div>
              <EviSplit preset="50-50" align="center">
                <div className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-6">
                  <p className="font-semibold mb-2">Venstre blok</p>
                  <p className="text-sm opacity-70">
                    Denne blok er en del af et 50-50 split midt i sektionen.
                  </p>
                </div>
                <div className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-6">
                  <p className="font-semibold mb-2">Højre blok</p>
                  <p className="text-sm opacity-70">Og her er højre side.</p>
                </div>
              </EviSplit>
              <EviAutoGrid size="md">
                {Array.from({ length: 4 }, (_, i) => (
                  <EviCard
                    key={i}
                    rows={3}
                    className="rounded-lg bg-[color-mix(in_oklch,currentColor_8%,transparent)] p-4"
                  >
                    <h4 className="font-semibold">Kort {i + 1}</h4>
                    <p className="text-sm opacity-70 mt-1">
                      Under splittet — samme sektion, automatisk gap-y.
                    </p>
                    <div className="mt-2">
                      <EviButton
                        variant="neutral"
                        appearance="outline"
                        size="sm"
                      >
                        Handling
                      </EviButton>
                    </div>
                  </EviCard>
                ))}
              </EviAutoGrid>
            </EviSection>
          </>
        );
      })()}
    </>
  );
}
