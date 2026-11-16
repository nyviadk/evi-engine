// Find eller start en dev-server til preview-routen (bruges af preview- og
// check-scripts).
//
// Next 16 tillader kun ÉN dev-server pr. projekt-mappe og skriver dens adresse
// i .next/dev/lock, så porten GÆTTES aldrig (brugeren kører mange projekter på
// skiftende porte). Kører der allerede en (typisk brugerens egen `npm run
// dev`), genbruges den; ellers startes en frisk på en fri port, og HELE træet
// dræbes bagefter med stop_dev_server. PREVIEW_DEV_URL peger et bestemt sted hen.

import { spawn, execSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";

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

/**
 * Dræb en dev-server, som ensure_dev_server selv startede. proc.pid er kun
 * shell/npm-wrapperen; `.kill()` efterlader `next`-barnet som zombie, der holder
 * porten. Windows: taskkill /T. Ellers er serveren startet i egen procesgruppe
 * (detached) → dræb gruppen.
 */
export function stop_dev_server(proc) {
  try {
    if (process.platform === "win32") {
      execSync(`taskkill /PID ${proc.pid} /T /F`, { stdio: "ignore" });
    } else {
      process.kill(-proc.pid, "SIGTERM");
    }
  } catch {
    /* allerede væk */
  }
}

/**
 * Returnerer { url, proc }. `proc` er kun sat, når serveren blev startet her,
 * og skal da stoppes med stop_dev_server. `probe_path` er den rute, der skal
 * bruges (varmer også kompileringen op).
 */
export async function ensure_dev_server(probe_path) {
  if (process.env.PREVIEW_DEV_URL) {
    const url = process.env.PREVIEW_DEV_URL.replace(/\/+$/, "");
    console.log(`→ Bruger PREVIEW_DEV_URL: ${url}`);
    return { url, proc: null };
  }

  // 1. Genbrug en allerede kørende dev-server (adressen står i lock-filen).
  //    Generøs timeout: første hit på ruten trigger en kold kompilering.
  const running = read_dev_lock();
  if (running) {
    const status = await probe_status(`${running.appUrl}${probe_path}`, 90_000);
    if (status !== null) {
      console.log(
        `→ Genbruger kørende dev-server: ${running.appUrl} (pid ${running.pid})` +
          (status === 200 ? "" : ` ⚠ ruten gav ${status}`),
      );
      return { url: running.appUrl, proc: null }; // ikke vores at dræbe
    }
    console.log(
      `  ⚠ Lock peger på ${running.appUrl}, men den svarer ikke — starter frisk.`,
    );
  }

  // 2. Ingen kørende server → start en frisk på en fri port.
  const port = await get_free_port();
  const url = `http://localhost:${port}`;
  console.log(`→ Starter dedikeret \`next dev\` på ${url}…`);

  const proc = spawn("npm", ["run", "dev", "--", "--port", String(port)], {
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
    detached: process.platform !== "win32",
  });

  // Fang exit + log, så en tidlig crash ikke bliver til 180s tavs polling.
  let exit_code = null;
  proc.on("exit", (code) => (exit_code = code ?? 0));
  let log = "";
  const capture = (buf) => (log += String(buf));
  proc.stdout.on("data", capture);
  proc.stderr.on("data", capture);

  console.log("  … venter på klar (første kompilering kan tage et minut)…");
  const target_url = `${url}${probe_path}`;
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    if (exit_code !== null) {
      throw new Error(
        `Dev-server døde (exit ${exit_code}) før den blev klar:\n${log.slice(-1000)}`,
      );
    }
    if ((await probe_status(target_url, 30_000)) === 200) {
      console.log("  ✓ Dev-server klar.");
      return { url, proc };
    }
    await sleep(1500);
  }
  stop_dev_server(proc);
  throw new Error(
    `Dev-server på ${url} blev ikke klar inden for 180s. Sidste log:\n${log.slice(-1000)}`,
  );
}
