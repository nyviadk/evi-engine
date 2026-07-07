#!/usr/bin/env node
// Slice-preview screenshot + upload automation.
//
// Dynamic discovery: globs `slices/*/mock.ts` — any slice with a mock file
// is auto-picked-up. No hardcoded list to maintain.
//
// Skip-if-exists: variations that already have `imageUrl` set in model.json
// are skipped by default. Use --force to re-generate for all variations
// (fx efter design-ændringer der påvirker hvordan slicen ser ud).
//
// Flags:
//   --force / -f                     re-genererer alle variations, ignorerer imageUrl-check
//   --slice <slice_id> / -s <slice_id>  process kun denne slice (kan gentages)
//
// Eksempler:
//   npm run evi:preview-slices                    # alt uden imageUrl
//   npm run evi:preview-slices -- --force         # regen alt
//   npm run evi:preview-slices -- -s header_classic  # kun header_classic (hvis den ikke har imageUrl)
//   npm run evi:preview-slices -- -f -s header_classic  # regen kun header_classic
//
// Workflow per slice-variation:
//   1. Playwright screenshots /slice-preview/<slice_id>/<variation_id>
//   2. `prismic slice edit-variation <var> --from-slice <slice_id>
//      --screenshot <png>` uploads to evi-engine + updates local model.json
//   3. After all: `prismic push --force` syncs to evi-engine cloud
//   4. Manual: `npm run evi:sync-slices -- --all` to propagate to tenants

import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import fs from "node:fs";
import path from "node:path";

// ─── Config ───────────────────────────────────────────────────────────

const EXPECTED_REPO = "evi-engine";
const DEV_URL = "http://localhost:3000";
const VIEWPORT = { width: 1920, height: 1080 };
const SLICES_DIR = "slices";

// ─── CLI args ─────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const FORCE = args.includes("--force") || args.includes("-f");

// Extract --slice / -s targets (can repeat)
const SLICE_TARGETS = new Set();
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--slice" || args[i] === "-s") {
    const next = args[i + 1];
    if (!next || next.startsWith("-")) {
      console.error(`✗ Missing value after ${args[i]}`);
      process.exit(1);
    }
    SLICE_TARGETS.add(next);
    i++;
  }
}
const TARGET_MODE = SLICE_TARGETS.size > 0;

// ─── Safety: verify Prismic CLI is on evi-engine repo ─────────────────

function verify_prismic_repo() {
  console.log("→ Verifying Prismic CLI repo…");
  const status = execSync("npx prismic status", { encoding: "utf-8" });
  const match = status.match(/Repository:\s*(\S+)/);
  if (!match) {
    throw new Error(
      "Could not parse `prismic status`. Are you logged in? Run `npx prismic login`.",
    );
  }
  const current = match[1];
  if (current !== EXPECTED_REPO) {
    throw new Error(
      `Refusing to run: prismic CLI is on repo "${current}", expected "${EXPECTED_REPO}". Preview screenshots must only be uploaded to the shared dev repo — never a tenant repo.`,
    );
  }
  console.log(`  ✓ Prismic repo = ${current}`);
}

// ─── Discover slices with mock.ts files ───────────────────────────────

function discover_slices() {
  const folders = fs
    .readdirSync(SLICES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const discovered = [];
  for (const folder of folders) {
    const mock_path = path.join(SLICES_DIR, folder, "mock.ts");
    const model_path = path.join(SLICES_DIR, folder, "model.json");
    if (!fs.existsSync(mock_path)) continue;
    if (!fs.existsSync(model_path)) continue;

    const model = JSON.parse(fs.readFileSync(model_path, "utf-8"));
    const slice_id = model.id;
    const variations = (model.variations ?? []).map((v) => ({
      id: v.id,
      hasImage: !!v.imageUrl,
    }));

    discovered.push({ slice_id, folder, variations });
  }
  return discovered;
}

// ─── Ensure `next dev` is running ─────────────────────────────────────

async function wait_for_dev_server(url, timeout_ms = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeout_ms) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // still starting
    }
    await sleep(500);
  }
  throw new Error(`Dev server never came up on ${url}`);
}

async function ensure_dev_server() {
  console.log("→ Checking dev server…");
  try {
    const res = await fetch(DEV_URL);
    if (res.status < 500) {
      console.log("  ✓ Dev server already running");
      return null;
    }
  } catch {
    // not running
  }
  console.log("  → Starting `next dev`…");
  const proc = spawn("npm", ["run", "dev"], {
    stdio: "ignore",
    shell: true,
    detached: false,
  });
  await wait_for_dev_server(DEV_URL);
  console.log("  ✓ Dev server up");
  return proc;
}

// ─── Screenshot + upload per slice/variation ──────────────────────────

async function screenshot_and_upload(browser, slice) {
  const { slice_id, folder, variations } = slice;
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  let processed = 0;
  let skipped = 0;

  for (const variation of variations) {
    if (variation.hasImage && !FORCE) {
      console.log(
        `  ⊘ ${slice_id}/${variation.id} — imageUrl already set (use --force to overwrite)`,
      );
      skipped++;
      continue;
    }

    console.log(`→ ${slice_id}/${variation.id}`);

    const preview_url = `${DEV_URL}/slice-preview/${slice_id}/${variation.id}`;
    await page.goto(preview_url, { waitUntil: "networkidle" });

    const screenshot_dir = path.join(SLICES_DIR, folder);
    const screenshot_path = path.join(
      screenshot_dir,
      `preview-${variation.id}.png`,
    );

    const target = page.locator('[data-testid="preview-target"]');
    await target.waitFor({ state: "visible" });
    await target.screenshot({ path: screenshot_path });
    console.log(`  ✓ Screenshot → ${screenshot_path}`);

    execSync(
      `npx prismic slice edit-variation ${variation.id} --from-slice ${slice_id} --screenshot ./${screenshot_path.replace(/\\/g, "/")}`,
      { stdio: "inherit" },
    );
    processed++;
  }

  await context.close();
  return { processed, skipped };
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
  verify_prismic_repo();

  let slices = discover_slices();
  if (slices.length === 0) {
    console.log("\n⚠ No slices with mock.ts found in slices/. Nothing to do.");
    return;
  }
  console.log(
    `\n→ Discovered ${slices.length} slice(s) with mock.ts: ${slices.map((s) => s.slice_id).join(", ")}`,
  );

  if (TARGET_MODE) {
    const unknown = [...SLICE_TARGETS].filter(
      (id) => !slices.some((s) => s.slice_id === id),
    );
    if (unknown.length > 0) {
      throw new Error(
        `Unknown slice(s) in --slice targets (not found in slices/ with mock.ts): ${unknown.join(", ")}`,
      );
    }
    slices = slices.filter((s) => SLICE_TARGETS.has(s.slice_id));
    console.log(`→ --slice targeting: ${[...SLICE_TARGETS].join(", ")}`);
  }
  if (FORCE) console.log("→ --force enabled: re-generating regardless of imageUrl");

  const dev_proc = await ensure_dev_server();

  const browser = await chromium.launch({ headless: true });
  let total_processed = 0;
  let total_skipped = 0;

  try {
    for (const slice of slices) {
      const { processed, skipped } = await screenshot_and_upload(browser, slice);
      total_processed += processed;
      total_skipped += skipped;
    }
  } finally {
    await browser.close();
    if (dev_proc) dev_proc.kill();
  }

  if (total_processed > 0) {
    console.log("\n→ Pushing updated slice models to Prismic cloud…");
    execSync("npx prismic push --force", { stdio: "inherit" });
    console.log("  ✓ Pushed to evi-engine cloud");
  } else {
    console.log("\n→ Nothing to push (all variations skipped)");
  }

  console.log(`\n✓ Done. Processed ${total_processed}, skipped ${total_skipped}.`);
  if (total_processed > 0) {
    console.log("\nNext steps:");
    console.log(
      "  1. Verify preview images in Prismic slice picker",
    );
    console.log(
      "  2. Run `npm run evi:sync-slices -- --all` to propagate to tenants",
    );
    console.log("  3. `git status` → commit updated slices/*/model.json");
  }
}

main().catch((err) => {
  console.error("\n✗ Preview automation failed:", err.message);
  process.exit(1);
});
