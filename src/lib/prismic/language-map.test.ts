import test from "node:test";
import assert from "node:assert/strict";
import type { PrismicDocument } from "@prismicio/client";
import * as pathsNs from "./paths";
import * as mapNs from "./language-map";

// Under tsx' CJS-interop kan navngivne exports ligge under `default`.
const { build_tree_from_docs, build_language_map } =
  (pathsNs as { default?: typeof pathsNs }).default ?? pathsNs;
const { page_languages } =
  (mapNs as { default?: typeof mapNs }).default ?? mapNs;

const page = (
  id: string,
  uid: string,
  lang: string,
  alternates: { id: string; uid: string; lang: string }[] = [],
) =>
  ({
    id,
    uid,
    lang,
    alternate_languages: alternates.map((a) => ({ ...a, type: "page" })),
    data: { parent_page: { link_type: "Any" } },
  }) as unknown as PrismicDocument;

// Forside kun på dansk; privatlivspolitikken på dansk og engelsk.
const docs = [
  page("h", "home", "da-dk"),
  page("p", "privatlivspolitik", "da-dk", [{ id: "pe", uid: "privacy-policy", lang: "en-eu" }]),
  page("pe", "privacy-policy", "en-eu", [{ id: "p", uid: "privatlivspolitik", lang: "da-dk" }]),
  page("o", "om-ø", "da-dk"),
];
const tree = build_tree_from_docs(docs);
const both = { "da-dk": "/da-dk/privatlivspolitik", "en-eu": "/en-eu/privacy-policy" };

test("build_language_map: hver side peger på sine egne sprogversioner", () => {
  const map = build_language_map(docs, tree, { default_locale: "da-dk", force_lang_prefix: true });
  assert.deepEqual(map["/da-dk/privatlivspolitik"], both);
  assert.deepEqual(map["/en-eu/privacy-policy"], both);
  assert.deepEqual(map["/da-dk"], { "da-dk": "/da-dk" });
});

test("page_languages: aktuel side, også efter rewrite uden præfiks", () => {
  const map = build_language_map(docs, tree, { default_locale: "da-dk", force_lang_prefix: true });
  assert.deepEqual(page_languages(map, "/en-eu/privacy-policy", "en-eu"), both);
  assert.deepEqual(page_languages(map, "/privatlivspolitik", "da-dk"), both);
  // Forsiden findes kun på dansk → ét sprog, så vælgeren skjules.
  assert.deepEqual(page_languages(map, "/", "da-dk"), { "da-dk": "/da-dk" });
  // /en-eu er en sprog-fallback for den danske forside → ukendt side.
  assert.deepEqual(page_languages(map, "/en-eu", "en-eu"), {});
  assert.deepEqual(page_languages(map, "/da-dk/om-%C3%B8", "da-dk"), { "da-dk": "/da-dk/om-ø" });
});

test("page_languages: standardsproget uden præfiks", () => {
  const map = build_language_map(docs, tree, { default_locale: "da-dk", force_lang_prefix: false });
  assert.deepEqual(page_languages(map, "/privatlivspolitik", "da-dk"), {
    "da-dk": "/privatlivspolitik",
    "en-eu": "/en-eu/privacy-policy",
  });
  assert.deepEqual(page_languages(map, "/", "da-dk"), { "da-dk": "/" });
});
