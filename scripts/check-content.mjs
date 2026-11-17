#!/usr/bin/env node
// Indholdstjek af en rigtig side, før indhold afleveres: den publicerede side
// eller et Prismic-preview-link (linket sætter preview-cookien, så releasen
// vises). Screenshots ved flere bredder i Chromium og WebKit, vandret overflow,
// tekst der stikker ud af sin kasse, billeder der ikke loader, links/knapper
// uden navn og overskriftsrækkefølgen.
//
// Brug:   npm run evi:check-content -- --url <side eller preview-link> [--widths 375,1440] [--browser chromium|webkit]
//
// Screenshots lægges i <tmp>/evi-content/<host>/ og skal ses igennem. Overflow,
// tekst ud af sin kasse, brudte billeder eller navnløse links giver exit-kode 1;
// spring i overskriftsniveauer og flere h1 er advarsler.

import { chromium, webkit } from "playwright";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { arg } from "./cli-args.mjs";
import { find_text_spills } from "./page-checks.mjs";

// 280: smalle telefoner og zoomet tekst; dér klemmes indlejrede kasser først.
const DEFAULT_WIDTHS = [280, 375, 768, 1024, 1280, 1440];
const BROWSERS = { chromium, webkit };

const url = arg("--url");
const only_browser = arg("--browser");
const widths =
  arg("--widths")
    ?.split(",")
    .map(Number)
    .filter((n) => n > 0) ?? DEFAULT_WIDTHS;

if (!url) {
  console.error("✗ Angiv siden: npm run evi:check-content -- --url <side eller preview-link>");
  process.exit(1);
}
if (only_browser && !BROWSERS[only_browser]) {
  console.error(`✗ Ukendt --browser "${only_browser}" (chromium eller webkit)`);
  process.exit(1);
}

const out = path.join(os.tmpdir(), "evi-content", new URL(url).host);
fs.mkdirSync(out, { recursive: true });

// Rul siden igennem, så lazy-billeder når at loade før tjekket.
async function load_lazy(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
}

// Kører i siden. Dekorative områder (aria-hidden) tæller ikke med.
function inspect() {
  const visible = (el) => !el.closest("[aria-hidden='true']");
  const accessible_name = (el) => {
    const labelledby = el.getAttribute("aria-labelledby");
    const by_id = labelledby
      ? labelledby
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent ?? "")
          .join(" ")
      : "";
    const alts = [...el.querySelectorAll("img")].map((img) => img.alt).join(" ");
    return [el.getAttribute("aria-label"), by_id, el.textContent, alts, el.title]
      .map((s) => (s ?? "").trim())
      .find(Boolean);
  };
  const levels = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")]
    .filter(visible)
    .map((h) => Number(h.tagName[1]));
  const skips = levels
    .map((level, i) => (i > 0 && level > levels[i - 1] + 1 ? `h${levels[i - 1]}→h${level}` : null))
    .filter(Boolean);
  return {
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    broken: [...document.images]
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src),
    unnamed: [...document.querySelectorAll("a[href], button")]
      .filter((el) => visible(el) && !accessible_name(el))
      .map((el) => el.outerHTML.slice(0, 100)),
    outline: levels.map((level) => `h${level}`).join(" "),
    h1: levels.filter((level) => level === 1).length,
    skips,
  };
}

async function check_browser(engine, browser_name) {
  const browser = await engine.launch();
  let failed = false;
  try {
    // reducedMotion: skærmbillederne viser slut-tilstanden, ikke midt i en indtoning.
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    // Første besøg følger preview-linkets redirect og sætter cookien; resten
    // af bredderne genindlæser den endelige side i samme context.
    await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
    const page_url = page.url();
    console.log(`${browser_name}: ${page_url}`);

    let report = null;
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(page_url, { waitUntil: "networkidle", timeout: 120_000 });
      await load_lazy(page);
      report = await page.evaluate(inspect);
      const spills = await page.evaluate(find_text_spills);
      const file = path.join(out, `${browser_name}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      const problems = [
        report.overflow > 0 && `overflow ${report.overflow}px`,
        spills.length > 0 && `${spills.length} tekster ud af deres kasse`,
        report.broken.length > 0 && `${report.broken.length} brudte billeder`,
        report.unnamed.length > 0 && `${report.unnamed.length} links/knapper uden navn`,
      ].filter(Boolean);
      if (problems.length > 0) failed = true;
      console.log(
        `${problems.length ? "✗" : "✓"} ${browser_name} @${width}px  ${problems.join(", ") || "ok"}  → ${file}`,
      );
      for (const spill of spills) console.log(`    ${spill}`);
      for (const src of report.broken) console.log(`    brudt billede: ${src}`);
      for (const html of report.unnamed) console.log(`    uden navn: ${html}`);
    }

    if (report) {
      console.log(`  overskrifter: ${report.outline || "ingen"}`);
      if (report.h1 !== 1) console.log(`  ⚠ ${report.h1} h1 på siden (forventet 1)`);
      for (const skip of report.skips) console.log(`  ⚠ spring i overskrifter: ${skip}`);
    }
  } finally {
    await browser.close();
  }
  return failed;
}

async function main() {
  let failed = false;
  for (const [browser_name, engine] of Object.entries(BROWSERS)) {
    if (only_browser && only_browser !== browser_name) continue;
    if (await check_browser(engine, browser_name)) failed = true;
  }
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
