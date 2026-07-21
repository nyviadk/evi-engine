import test from "node:test";
import assert from "node:assert/strict";
import type { PrismicDocument } from "@prismicio/client";
import * as pathsNs from "./paths";

// paths.ts eksporterer navngivne funktioner; under tsx's CJS-interop kan de
// ligge under `default`. Håndtér begge loader-former, så testen kører uanset.
type PathsApi = {
  build_tree_from_docs: (docs: PrismicDocument[]) => Map<string, string[]>;
  build_breadcrumb_trails: (
    docs: PrismicDocument[],
  ) => Map<string, { uid: string; title: string }[]>;
  resolve_page_url: (
    id: string,
    lang: string,
    tree: Map<string, string[]>,
    cfg: { default_locale: string; force_lang_prefix: boolean },
  ) => string;
};
const { build_tree_from_docs, build_breadcrumb_trails, resolve_page_url } =
  (pathsNs as { default?: PathsApi }).default ??
  (pathsNs as unknown as PathsApi);

const rel = (id: string) => ({ link_type: "Document", id }) as unknown;
const none = { link_type: "Any" } as unknown;
const doc = (id: string, uid: string, parent: unknown, meta_title: string) =>
  ({
    id,
    uid,
    lang: "da-dk",
    data: { parent_page: parent, meta_title },
  }) as unknown as PrismicDocument;

// Repræsentativt sti-træ: home (rod), en sektion, en underside, og en side hvis
// parent ER home (skal ignoreres — ellers ville stien blive /home/<child>).
const docs = [
  doc("h", "home", none, "Forside"),
  doc("y", "ydelser", none, "Ydelser"),
  doc("a", "angst", rel("y"), "Angst"),
  doc("k", "kontakt", rel("h"), "Kontakt"),
];
const cfg = { default_locale: "da-dk", force_lang_prefix: false };

test("build_tree_from_docs: rod, nesting, home-parent-afvisning", () => {
  const tree = build_tree_from_docs(docs);
  assert.deepEqual(tree.get("h"), ["home"]);
  assert.deepEqual(tree.get("y"), ["ydelser"]);
  assert.deepEqual(tree.get("a"), ["ydelser", "angst"]);
  assert.deepEqual(tree.get("k"), ["kontakt"]); // home som parent ignoreres
});

test("resolve_page_url: default locale uden præfiks", () => {
  const tree = build_tree_from_docs(docs);
  assert.equal(resolve_page_url("h", "da-dk", tree, cfg), "/");
  assert.equal(resolve_page_url("a", "da-dk", tree, cfg), "/ydelser/angst");
  assert.equal(resolve_page_url("k", "da-dk", tree, cfg), "/kontakt");
});

test("build_breadcrumb_trails: home har ingen krumme, titler bæres fra meta_title", () => {
  const trails = build_breadcrumb_trails(docs);
  assert.deepEqual(trails.get("h"), []);
  assert.deepEqual(
    (trails.get("a") ?? []).map((c) => `${c.uid}:${c.title}`),
    ["ydelser:Ydelser", "angst:Angst"],
  );
  assert.deepEqual(
    (trails.get("k") ?? []).map((c) => `${c.uid}:${c.title}`),
    ["kontakt:Kontakt"],
  );
});

test("cyklus-guard: direkte selv-reference looper ikke", () => {
  const tree = build_tree_from_docs([doc("x", "x", rel("x"), "X")]);
  assert.deepEqual(tree.get("x"), ["x"]);
});

test("cyklus-guard: indirekte parent-cyklus terminerer (ingen stack overflow)", () => {
  const tree = build_tree_from_docs([
    doc("p", "p", rel("q"), "P"),
    doc("q", "q", rel("p"), "Q"),
  ]);
  assert.equal(tree.size, 2); // begge opløst → memoiseringen brød cyklussen
});
