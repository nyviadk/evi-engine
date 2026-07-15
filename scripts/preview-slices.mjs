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
import net from "node:net";
import fs from "node:fs";
import path from "node:path";

// ─── Config ───────────────────────────────────────────────────────────

const EXPECTED_REPO = "evi-engine";
// Sættes af ensure_dev_server() til en fri port som OS'et selv tildeler —
// aldrig hardcodet/gættet, fordi brugeren kører mange projekter samtidig.
let DEV_URL = "";
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

// ─── Find / start dev-server til preview ──────────────────────────────
//
// Next 16 tillader kun ÉN dev-server pr. projekt-mappe og skriver dens adresse
// i .next/dev/lock — så vi GÆTTER aldrig porten (brugeren kører mange projekter
// på skiftende porte). Kører der allerede en (typisk brugerens egen `npm run
// dev`) → vi genbruger den; ellers starter vi en frisk på en fri port og dræber
// HELE træet bagefter. Override med PREVIEW_DEV_URL for at pege et bestemt sted.

const DEV_LOCK = path.join(".next", "dev", "lock");

// Læs den kørende dev-servers adresse fra Next's lock-fil (findes kun mens en
// server kører for dette repo). Returnerer {appUrl, pid} eller null.
function read_dev_lock() {
  try {
    const raw = fs.readFileSync(DEV_LOCK, "utf-8");
    const { appUrl, pid } = JSON.parse(raw);
    return appUrl ? { appUrl: appUrl.replace(/\/+$/, ""), pid } : null;
  } catch {
    return null; // ingen lock = ingen kørende server
  }
}

// Bind port 0 → OS giver en garanteret fri port; luk igen og brug nummeret.
function get_free_port() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function probe_status(url, timeout_ms) {
  try {
    const res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(timeout_ms),
    });
    return res.status;
  } catch {
    return null; // connection refused / timeout / kompilering i gang
  }
}

// Dræb hele process-træet. På Windows er proc.pid `npm`-wrapperen; `.kill()`
// efterlader `next`-barnet som zombie → taskkill /T tager hele træet.
function kill_tree(proc) {
  if (process.platform === "win32") {
    try {
      execSync(`taskkill /PID ${proc.pid} /T /F`, { stdio: "ignore" });
    } catch {
      /* allerede væk */
    }
  } else {
    proc.kill();
  }
}

async function ensure_dev_server(probe_path) {
  if (process.env.PREVIEW_DEV_URL) {
    DEV_URL = process.env.PREVIEW_DEV_URL.replace(/\/+$/, "");
    console.log(`→ Bruger PREVIEW_DEV_URL: ${DEV_URL}`);
    return null;
  }

  // 1. Genbrug en allerede kørende dev-server (adressen står i lock-filen).
  //    Generøs timeout: første hit på ruten trigger en kold kompilering.
  const running = read_dev_lock();
  if (running) {
    const status = await probe_status(`${running.appUrl}${probe_path}`, 90_000);
    if (status !== null) {
      DEV_URL = running.appUrl;
      console.log(
        `→ Genbruger kørende dev-server: ${DEV_URL} (pid ${running.pid})` +
          (status === 200 ? "" : ` ⚠ ruten gav ${status}`),
      );
      return null; // ikke vores at dræbe
    }
    console.log(
      `  ⚠ Lock peger på ${running.appUrl}, men den svarer ikke — starter frisk.`,
    );
  }

  // 2. Ingen kørende server → start en frisk på en fri port.
  const port = await get_free_port();
  DEV_URL = `http://localhost:${port}`;
  console.log(`→ Starter dedikeret \`next dev\` på ${DEV_URL}…`);

  const proc = spawn("npm", ["run", "dev", "--", "--port", String(port)], {
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });

  // Fang exit + log, så en tidlig crash ikke bliver til 180s tavs polling.
  let exit_code = null;
  proc.on("exit", (code) => (exit_code = code ?? 0));
  let log = "";
  const capture = (buf) => (log += String(buf));
  proc.stdout.on("data", capture);
  proc.stderr.on("data", capture);

  // Poll den rute vi faktisk skal screenshotte (warmer også kompileringen).
  console.log("  … venter på klar (første kompilering kan tage et minut)…");
  const target_url = `${DEV_URL}${probe_path}`;
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    if (exit_code !== null) {
      throw new Error(
        `Dev-server døde (exit ${exit_code}) før den blev klar:\n${log.slice(-1000)}`,
      );
    }
    if ((await probe_status(target_url, 30_000)) === 200) {
      console.log("  ✓ Dev-server klar.");
      return proc;
    }
    await sleep(1500);
  }
  throw new Error(
    `Dev-server på ${DEV_URL} blev ikke klar inden for 180s. Sidste log:\n${log.slice(-1000)}`,
  );
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
    // 90s timeout: første render af et nyt slice trigger en kold kompilering
    // (fx iconify-pack til EviIcon) der kan overstige Playwrights 30s-default.
    await page.goto(preview_url, { waitUntil: "networkidle", timeout: 90_000 });

    const screenshot_dir = path.join(SLICES_DIR, folder);
    const screenshot_path = path.join(
      screenshot_dir,
      `preview-${variation.id}.png`,
    );

    const target = page.locator('[data-testid="preview-target"]');
    await target.waitFor({ state: "visible", timeout: 90_000 });
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

  // Readiness-probe = den første rute vi skal screenshotte (garanteret 200).
  const first = slices[0];
  const first_variation = first.variations[0]?.id ?? "default";
  const probe_path = `/slice-preview/${first.slice_id}/${first_variation}`;
  const dev_proc = await ensure_dev_server(probe_path);

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
    if (dev_proc) kill_tree(dev_proc);
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
