#!/usr/bin/env node
// Synkroniser Prismic-modellen: push (lokal → sky) → pull (sky → lokal,
// normaliseret) → gen types. Logger automatisk ind hvis push fejler pga.
// manglende auth (åbner browseren; auth persisterer bagefter).
//
// Brug:   npm run evi:model

import { execSync } from "node:child_process";

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

console.log("→ Synkroniserer Prismic-model (push → pull → gen types)…");

try {
  run("npx prismic push --force");
} catch {
  console.log(
    "\n⚠ Push fejlede (sandsynligvis ikke logget ind) — kører login og prøver igen…",
  );
  run("npx prismic login");
  run("npx prismic push --force");
}

run("npx prismic pull --force");
run("npx prismic gen types");

console.log("\n✓ Model synkroniseret + typer genereret.");
