#!/usr/bin/env node
// Finder Tailwind-klasser, der har en kanonisk form: samme tjek som IntelliSense'
// "suggestCanonicalClasses" (fx top-[var(--x)] → top-(--x)), men for hele
// kodebasen og ikke kun de åbne filer. Bruger Tailwinds eget design-system
// (app/globals.css) og scanner (Oxide), så svaret er det samme som editorens.
// Exit 1 ved fund. Brug: npm run evi:check-classes
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const require = createRequire(path.join(root, "package.json"));
const { __unstable__loadDesignSystem } = require("@tailwindcss/node");
const { Scanner } = require("@tailwindcss/oxide");

const css_path = path.join(root, "app/globals.css");
const design = await __unstable__loadDesignSystem(readFileSync(css_path, "utf8"), {
  base: path.dirname(css_path),
});

const scanner = new Scanner({
  sources: ["src", "slices", "app"].map((dir) => ({
    base: path.join(root, dir),
    pattern: "**/*.{ts,tsx}",
    negated: false,
  })),
});
scanner.scan();

const hits = [];
for (const file of scanner.files) {
  const content = readFileSync(file, "utf8");
  const found = scanner.getCandidatesWithPositions({
    content,
    extension: path.extname(file).slice(1),
  });
  for (const { candidate, position } of found) {
    // Kun klasser, Tailwind faktisk laver CSS for.
    if (!design.candidatesToCss([candidate])[0]) continue;
    const [canonical] = design.canonicalizeCandidates([candidate]);
    if (canonical && canonical !== candidate) {
      const line = content.slice(0, position).split("\n").length;
      hits.push(`${path.relative(root, file)}:${line}  ${candidate}  →  ${canonical}`);
    }
  }
}

if (hits.length > 0) {
  console.log(hits.join("\n"));
  console.log(`\n✗ ${hits.length} klasse(r) kan skrives kanonisk (${scanner.files.length} filer).`);
  process.exit(1);
}
console.log(`✓ Alle Tailwind-klasser er kanoniske (${scanner.files.length} filer).`);
