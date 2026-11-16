#!/usr/bin/env node
// Responsivitets-tjek af en slice via dev-only preview-routen, før den
// afleveres: screenshots af hver variation ved fire bredder, vandret overflow
// og synligt tastaturfokus på første link. Kræver en kørende `npm run dev`.
//
// Brug:   npm run evi:check-responsive -- -s <slice_id> [--url http://localhost:3000]
//
// Screenshots lægges i <tmp>/evi-responsive/<slice_id>/ og skal ses igennem;
// overflow > 0 giver exit-kode 1.

import { chromium } from "playwright";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const WIDTHS = [375, 768, 1024, 1440];

const args = process.argv.slice(2);
const arg = (...names) => {
  const i = args.findIndex((a) => names.includes(a));
  return i >= 0 ? args[i + 1] : undefined;
};
const slice_id = arg("-s", "--slice");
const base = (
  arg("--url") ??
  process.env.PREVIEW_DEV_URL ??
  "http://localhost:3000"
).replace(/\/+$/, "");

if (!slice_id) {
  console.error("✗ Angiv slicen: npm run evi:check-responsive -- -s <slice_id>");
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

async function main() {
  const probe = await fetch(`${base}/slice-preview/${slice_id}/${variations[0]}`).catch(
    () => null,
  );
  if (!probe?.ok) {
    throw new Error(
      `Preview svarer ikke på ${base} (status ${probe?.status ?? "ingen forbindelse"}). Kør \`npm run dev\` først, eller sæt --url.`,
    );
  }

  const browser = await chromium.launch();
  let failed = false;
  try {
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
        const file = path.join(out, `${variation}-${width}.png`);
        await page.locator('[data-testid="preview-target"]').screenshot({ path: file });
        const ok = overflow <= 0;
        if (!ok) failed = true;
        console.log(
          `${ok ? "✓" : "✗"} ${variation} @${width}px  overflow ${Math.max(overflow, 0)}px  → ${file}`,
        );
        await page.close();
      }

      // Tastaturfokus: Tab indtil et link i previewet har fokus.
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
        const visible = focus.outline !== "none";
        const named = Boolean(focus.name);
        if (!visible || !named) failed = true;
        const file = path.join(out, `${variation}-focus.png`);
        await page.locator('[data-testid="preview-target"]').screenshot({ path: file });
        console.log(
          `${visible && named ? "✓" : "✗"} ${variation} fokus: "${focus.name}" outline=${focus.outline}  → ${file}`,
        );
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
