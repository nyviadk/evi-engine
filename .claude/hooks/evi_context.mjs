#!/usr/bin/env node
// Lægger hele Evi-kataloget (komponenter, props og hjælpere) ind i konteksten ved opstart og
// efter hver compact (SessionStart), og minder ved hver besked (UserPromptSubmit) om at slå op
// i det, før noget bygges. Kataloget læses fra kildekoden hver gang, så det aldrig er forældet.
// Inspireret af My Planios memory_rules.py. Test: echo '{"hook_event_name":"SessionStart"}' | node <denne fil>
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

// Claude Code viser kun et uddrag af tekst over 10.000 tegn.
const LIMIT = 9500;
// 100, ikke 120: med EviVideo nåede kataloget over LIMIT; navne og props er det vigtige.
const SUMMARY_MAX = 100;
const PROPS_MAX = 9;

const COMPONENT_GROUPS = [
  ["Layout", "src/components/layout"],
  ["UI", "src/components/ui"],
  ["Typografi", "src/components/typography"],
];
const PLANIO_DIR = "src/components/planio";
const HELPER_DIRS = ["src/lib/utils", "src/lib/prismic"];

const HEADER = `EVI-KATALOGET (genereret fra kildekoden ved opstart og efter hver compact).
REGEL, uanset hvad: når du bygger noget (komponent, del, layout, hjælper), slå op her FØRST, og genbrug eller udvid med én prop. Byg aldrig din egen udgave af noget, der står her. Kendte faldgruber:
- søster-kort med rækker, der skal flugte (titel/tekst/knap) = EviCard (grid-rows-subgrid) i et grid; tomme pladser = <div /> i layoutet (som PricesDefaultLayout)
- titel i et kort/en kolonne = EviTitle; mærkat/chip = EviTag; flade + padding = EviBox / box_surface; overskrift + tekst = EviHeadingGroup
- rå flex/grid-div = EviStack / EviAutoGrid / EviSplit / EviRow (se feedback_no_raw_layout_divs)
Fuld fil: læs komponenten, før du bruger eller udvider den.`;

const PROMPT_REMINDER =
  "Før du bygger eller ændrer UI: brug EVI-KATALOGET fra opstarten (mangler det i konteksten, så kør `node .claude/hooks/evi_context.mjs --plain`), genbrug frem for at bygge nyt, og læs de filer i MEMORY.md, der rører opgaven.";

function list_files(dir, ext) {
  try {
    return readdirSync(dir)
      .filter((name) => ext.some((e) => name.endsWith(e)) && !name.includes(".test."))
      .sort();
  } catch {
    return null;
  }
}

function clean_doc(doc) {
  const text = doc
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trim())
    .filter((line) => line && !line.startsWith("@"))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  // Sætningen slutter ved punktum + stort bogstav, så forkortelser som "evt." og "fx." ikke skærer.
  const sentence = text.match(/^(.+?[.!?])(?=\s+[A-ZÆØÅ"`(]|$)/)?.[1] ?? text;
  return sentence.length > SUMMARY_MAX ? `${sentence.slice(0, SUMMARY_MAX - 1)}…` : sentence;
}

// Kun JSDoc'en lige over mønstret: indholdet må ikke krydse et "*/", ellers fanges en
// props-kommentar længere oppe i filen.
function doc_before(source, pattern) {
  const match = source.match(
    new RegExp(String.raw`/\*\*((?:(?!\*/)[\s\S])*)\*/\s*(?:export\s+)?${pattern}`),
  );
  return match ? clean_doc(match[1]) : "";
}

function props_of(source, name) {
  const start = source.search(new RegExp(String.raw`export type ${name}Props(?:<[^>]*>)?\s*=`));
  if (start < 0) return [];
  let i = source.indexOf("{", start);
  if (i < 0) return [];
  let depth = 0;
  const names = [];
  for (let line_start = i; i < source.length; i++) {
    const c = source[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) break;
    } else if (c === "\n") {
      line_start = i + 1;
      if (depth === 1) {
        const prop = source.slice(line_start, source.indexOf("\n", line_start)).match(/^\s*"?([\w-]+)"?\??:/);
        if (prop) names.push(prop[1]);
      }
    }
  }
  return names.slice(0, PROPS_MAX);
}

// Kerne-komponenter får props og resumé på alle exports; Planio kun resumé på den første.
function describe_component_file(dir, file, { with_props }) {
  const source = readFileSync(path.join(dir, file), "utf8");
  const entries = [];
  const compound = source.match(/export const ([A-Z]\w*) = Object\.assign\((\w+),\s*\{([^}]*)\}\)/);
  const functions = [...source.matchAll(/export (?:async )?function ([A-Z]\w*)/g)].map((m) => m[1]);
  if (compound) {
    const [, name, root, parts] = compound;
    const summary = doc_before(source, String.raw`function ${root}\b`);
    const part_list = parts.split(",").map((p) => p.trim()).filter(Boolean).join(", ");
    entries.push(`${name} (.${part_list.split(", ").join(", .")})${summary ? `: ${summary}` : ""}`);
  }
  for (const [index, name] of functions.entries()) {
    const summarize = with_props || (index === 0 && !compound);
    const summary = summarize ? doc_before(source, String.raw`(?:async )?function ${name}\b`) : "";
    const props = with_props ? props_of(source, name) : [];
    entries.push(`${name}${props.length ? ` [${props.join(", ")}]` : ""}${summary ? `: ${summary}` : ""}`);
  }
  const helpers = [
    ...source.matchAll(/export (?:async )?function ([a-z]\w*)/g),
    ...source.matchAll(/export const ([A-Z][A-Z0-9_]+)\b/g),
  ].map((m) => m[1]);
  if (helpers.length) entries.push(`hjælpere: ${helpers.join(", ")}`);
  return entries.length ? `- ${file}: ${entries.join(" · ")}` : "";
}

function describe_helper_file(dir, file) {
  const source = readFileSync(path.join(dir, file), "utf8");
  const names = [
    ...source.matchAll(/export (?:async )?function (\w+)/g),
    ...source.matchAll(/export const (\w+)\s*[=:]/g),
  ].map((m) => m[1]);
  return names.length ? `- ${path.basename(dir)}/${file}: ${names.join(", ")}` : "";
}

function build_catalog(project_dir) {
  const problems = [];
  const sections = [HEADER];
  for (const [title, rel] of COMPONENT_GROUPS) {
    const dir = path.join(project_dir, rel);
    const files = list_files(dir, [".tsx"]);
    if (!files) {
      problems.push(`kunne ikke læse ${rel}`);
      continue;
    }
    sections.push(`\n${title} (${rel}):`);
    for (const file of files) {
      const line = describe_component_file(dir, file, { with_props: true });
      if (line) sections.push(line);
    }
  }
  const planio_dir = path.join(project_dir, PLANIO_DIR);
  const planio_files = list_files(planio_dir, [".tsx", ".ts"]);
  if (planio_files) {
    sections.push(`\nPlanio (${PLANIO_DIR}, kun til planio_-slices):`);
    for (const file of planio_files) {
      const line = describe_component_file(planio_dir, file, { with_props: false });
      if (line) sections.push(line);
    }
  }
  sections.push("\nHjælpere:");
  for (const rel of HELPER_DIRS) {
    const dir = path.join(project_dir, rel);
    const files = list_files(dir, [".ts"]);
    if (!files) {
      problems.push(`kunne ikke læse ${rel}`);
      continue;
    }
    for (const file of files) {
      const line = describe_helper_file(dir, file);
      if (line) sections.push(line);
    }
  }
  const context = sections.join("\n");
  if (context.length > LIMIT) problems.push(`kataloget har ${context.length} tegn, over grænsen på ${LIMIT}`);
  return { context, problems };
}

function session_output(project_dir) {
  let context = "";
  let problems = [];
  try {
    ({ context, problems } = build_catalog(project_dir));
  } catch (error) {
    problems = [`fejlede: ${error.message}`];
  }
  const output = { hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context } };
  if (problems.length) {
    const warning = `Evi-katalog-hooken ${problems.join("; ")}. Ret .claude/hooks/evi_context.mjs.`;
    output.systemMessage = warning;
    output.hookSpecificOutput.additionalContext = `${context}\n${warning} Sig det til brugeren.`.trim();
  }
  return output;
}

let payload = {};
try {
  // I en terminal er der ingen hook-data på stdin, og readFileSync(0) ville vente.
  payload = JSON.parse((process.stdin.isTTY ? "" : readFileSync(0, "utf8")) || "{}");
} catch {
  payload = {};
}
const project_dir = process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd();
if (process.argv.includes("--plain")) {
  const { context, problems } = build_catalog(project_dir);
  process.stdout.write(`${context}\n${problems.length ? `\nAdvarsel: ${problems.join("; ")}\n` : ""}`);
  process.exit(0);
}
const output =
  payload.hook_event_name === "UserPromptSubmit"
    ? { hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: PROMPT_REMINDER } }
    : session_output(project_dir);
process.stdout.write(JSON.stringify(output));
