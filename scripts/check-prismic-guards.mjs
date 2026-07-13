#!/usr/bin/env node
// Fejler bygget hvis nogen itererer et Prismic-collection-felt UDEN guard:
//   slice.primary.items.map(...)      ← "undefined.map"-crash-fælden
//   settings.data.links.forEach(...)
//
// Genererede Prismic-typer påstår at repeatable/gruppe-felter altid er arrays,
// men runtime kan give undefined (tomt repeatable, eller model-drift når et
// felt fjernes/omdøbes mens deployet kode stadig læser det → 500 på hele
// siden). TypeScript fanger det IKKE. Se memory feedback_prismic_isfilled.
//
// Guardede former PASSERER (matcher ikke):
//   X.primary.foo?.map(...)
//   (X.primary.foo ?? []).map(...)
//   const foo = X.primary.foo ?? []; foo.map(...)

import fs from "node:fs";
import path from "node:path";

const ROOTS = ["slices", "src", "app"];
const EXT = new Set([".ts", ".tsx"]);
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".open-next",
  "dist",
  ".git",
]);

// .primary.<felt>. eller .data.<felt>. efterfulgt DIREKTE af en array-metode
// (intet "?." og ingen "?? []"-wrap imellem → uguarded).
const RISKY =
  /\.(primary|data)\.\w+\.(map|filter|forEach|reduce|some|every|flatMap|find|findIndex)\s*\(/;

const hits = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name));
      continue;
    }
    if (!EXT.has(path.extname(entry.name))) continue;
    const file = path.join(dir, entry.name);
    fs.readFileSync(file, "utf8")
      .split(/\r?\n/)
      .forEach((text, i) => {
        if (RISKY.test(text))
          hits.push({ file, line: i + 1, text: text.trim() });
      });
  }
}

for (const root of ROOTS) if (fs.existsSync(root)) walk(root);

if (hits.length > 0) {
  console.error(
    `\n✗ Uguarded Prismic-collection-iteration (undefined.map-fælde) — ${hits.length} fund:\n`,
  );
  for (const h of hits) {
    console.error(`  ${h.file}:${h.line}`);
    console.error(`    ${h.text}`);
  }
  console.error(
    "\nGuard feltet før iteration, fx:\n" +
      "  const items = slice.primary.foo ?? [];   // eller foo?.map(...)\n" +
      "  // eller send feltet til en defensiv komponent (items?: ... = [])\n" +
      "Se memory feedback_prismic_isfilled.\n",
  );
  process.exit(1);
}

console.log("✓ Ingen uguarded Prismic-collection-iterationer fundet.");
