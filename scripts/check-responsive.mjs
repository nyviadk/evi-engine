#!/usr/bin/env node
// Responsivitets-tjek af en slice via dev-only preview-routen, før den
// afleveres: screenshots af hver variation ved fire bredder i Chromium og
// WebKit (Safaris motor), vandret overflow og synligt tastaturfokus på første
// link. Kræver en kørende `npm run dev`.
//
// Brug:   npm run evi:check-responsive -- -s <slice_id> [--url http://localhost:3000] [--browser chromium|webkit]
//
// Screenshots lægges i <tmp>/evi-responsive/<slice_id>/ og skal ses igennem;
// overflow > 0 eller usynligt/navnløst fokus giver exit-kode 1.

import { chromium, webkit } from "playwright";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const WIDTHS = [375, 768, 1024, 1440];
const BROWSERS = { chromium, webkit };

const args = process.argv.slice(2);
const arg = (...names) => {
  const i = args.findIndex((a) => names.includes(a));
  return i >= 0 ? args[i + 1] : undefined;
};
const slice_id = arg("-s", "--slice");
const only_browser = arg("--browser");
const base = (
  arg("--url") ??
  process.env.PREVIEW_DEV_URL ??
  "http://localhost:3000"
).replace(/\/+$/, "");

if (!slice_id) {
  console.error("✗ Angiv slicen: npm run evi:check-responsive -- -s <slice_id>");
  process.exit(1);
}
if (only_browser && !BROWSERS[only_browser]) {
  console.error(`✗ Ukendt --browser "${only_browser}" (chromium eller webkit)`);
  process.exit(1);
}

const folder = slice_id
  .split("_")
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join("");
const model_path = path.join("slices", folder, "model.json");
if (!fs.existsSync(model_path)) {
  console.error(`✗ Fandt ikke ${model_path}`);
  process.exit(1);
}
const variations = JSON.parse(fs.readFileSync(model_path, "utf-8")).variations.map(
  (v) => v.id,
);

const out = path.join(os.tmpdir(), "evi-responsive", slice_id);
fs.mkdirSync(out, { recursive: true });

async function check_widths(browser, browser_name) {
  let failed = false;
  for (const variation of variations) {
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(`${base}/slice-preview/${slice_id}/${variation}`, {
        waitUntil: "networkidle",
        timeout: 120_000,
      });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      const file = path.join(out, `${browser_name}-${variation}-${width}.png`);
      await page.locator('[data-testid="preview-target"]').screenshot({ path: file });
      const ok = overflow <= 0;
      if (!ok) failed = true;
      console.log(
        `${ok ? "✓" : "✗"} ${browser_name} ${variation} @${width}px  overflow ${Math.max(overflow, 0)}px  → ${file}`,
      );
      await page.close();
    }
  }
  return failed;
}

// Kun i Chromium: Safari/WebKit på macOS tabber som standard ikke til links,
// så Tab-tjekket ville fejle falsk dér. Fokus-stylingen er den samme CSS.
async function check_focus(browser) {
  let failed = false;
  for (const variation of variations) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${base}/slice-preview/${slice_id}/${variation}`, {
      waitUntil: "networkidle",
    });
    let focus = null;
    for (let i = 0; i < 20 && !focus; i++) {
      await page.keyboard.press("Tab");
      focus = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el?.closest('[data-testid="preview-target"]') || el.tagName !== "A") {
          return null;
        }
        return {
          outline: getComputedStyle(el).outlineStyle,
          name:
            el.getAttribute("aria-label") ||
            el.querySelector("img")?.alt ||
            el.textContent.trim(),
        };
      });
    }
    if (!focus) {
      console.log(`– ${variation}: ingen links at fokusere`);
    } else {
      const ok = focus.outline !== "none" && Boolean(focus.name);
      if (!ok) failed = true;
      const file = path.join(out, `chromium-${variation}-focus.png`);
      await page.locator('[data-testid="preview-target"]').screenshot({ path: file });
      console.log(
        `${ok ? "✓" : "✗"} ${variation} fokus: "${focus.name}" outline=${focus.outline}  → ${file}`,
      );
    }
    await page.close();
  }
  return failed;
}

async function main() {
  const probe = await fetch(`${base}/slice-preview/${slice_id}/${variations[0]}`).catch(
    () => null,
  );
  if (!probe?.ok) {
    throw new Error(
      `Preview svarer ikke på ${base} (status ${probe?.status ?? "ingen forbindelse"}). Kør \`npm run dev\` først, eller sæt --url.`,
    );
  }

  let failed = false;
  for (const [browser_name, engine] of Object.entries(BROWSERS)) {
    if (only_browser && only_browser !== browser_name) continue;
    const browser = await engine.launch();
    try {
      if (await check_widths(browser, browser_name)) failed = true;
      if (browser_name === "chromium" && (await check_focus(browser))) {
        failed = true;
      }
    } finally {
      await browser.close();
    }
  }
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
