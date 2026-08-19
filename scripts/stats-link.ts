// Operatør-script: generér (eller rotér) en kundes stats-link.
//
//   npm run evi:stats-link -- <repo>          → printer kundens nuværende link
//   npm run evi:stats-link -- <repo> --new    → rotér (bump version), gammelt dør
//
// Kører separat fra onboarding. Læser EVI_STATS_SECRET fra .dev.vars (samme
// værdi som `wrangler secret put EVI_STATS_SECRET`), og gemmer versionen i
// TENANTS-KV under nøglen "stats_ver:<repo>" via wrangler.

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { make_stats_token } from "../src/lib/analytics/token";

const STATS_HOST = "stats.nyvia.dk";

function read_secret(): string {
  let text: string;
  try {
    text = readFileSync(".dev.vars", "utf8");
  } catch {
    throw new Error(
      "Kunne ikke læse .dev.vars — tilføj EVI_STATS_SECRET der (samme værdi som `wrangler secret put`).",
    );
  }
  const value = text.match(/^\s*EVI_STATS_SECRET\s*=\s*"?([^"\r\n]+)"?\s*$/m)?.[1];
  if (!value) throw new Error("EVI_STATS_SECRET mangler i .dev.vars.");
  return value;
}

function kv_get_version(repo: string): number {
  try {
    const out = execSync(
      `npx wrangler kv key get "stats_ver:${repo}" --binding TENANTS --remote`,
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    const n = parseInt(out.replace(/[^0-9]/g, ""), 10);
    return Number.isInteger(n) && n > 0 ? n : 1;
  } catch {
    return 1; // nøglen findes ikke endnu → version 1
  }
}

function kv_put_version(repo: string, version: number): void {
  execSync(
    `npx wrangler kv key put "stats_ver:${repo}" "${version}" --binding TENANTS --remote`,
    { stdio: "inherit" },
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const rotate = args.includes("--new");
  const repo = args.find((a) => !a.startsWith("--"));
  if (!repo || !/^[a-z0-9-]+$/.test(repo)) {
    console.error("Brug: npm run evi:stats-link -- <repo> [--new]");
    process.exit(1);
  }

  const secret = read_secret();
  let version = kv_get_version(repo);
  if (rotate) {
    version += 1;
    kv_put_version(repo, version);
  }

  const token = await make_stats_token(secret, repo, version);
  console.log(
    `\n  ${rotate ? "Nyt link" : "Link"} for "${repo}" (version ${version}):\n`,
  );
  console.log(`  https://${STATS_HOST}/${token}\n`);
  if (rotate) console.log("  ⚠ Tidligere links er nu ugyldige.\n");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
