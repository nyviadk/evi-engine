import test from "node:test";
import assert from "node:assert/strict";
import {
  compute_slice_contexts,
  joins_footer,
  type EviColors,
  type SliceWithPrimary,
} from "./slices";

const colors: EviColors = {
  light: "#f9f9f9",
  dark: "#20272e",
  primary: "#00c6b4",
  secondary: "#00c6b4",
};

const band = (background_theme?: string): SliceWithPrimary => ({
  slice_type: "text_content",
  variation: "default",
  primary: { background_theme },
});
const image_band: SliceWithPrimary = {
  slice_type: "text_content",
  primary: { background_theme: "Lys", backgroundSectionImage: { url: "https://x/y.jpg" } },
};
const cover_hero: SliceWithPrimary = {
  slice_type: "hero",
  variation: "cover",
  primary: { background_theme: "Lys" },
};

const collapses = (slices: SliceWithPrimary[], c?: EviColors) =>
  compute_slice_contexts(slices, c).map((s) => s.collapsePadding);

test("første slice er hero og kollapser aldrig", () => {
  const [first] = compute_slice_contexts([band("Lys")], colors);
  assert.deepEqual(first, { theme: "light", collapsePadding: false, isHero: true, eagerImages: true });
});

test("samme flade kollapser, anden flade gør ikke", () => {
  assert.deepEqual(collapses([band("Lys"), band("Lys"), band("Mørk"), band("Mørk")], colors), [false, true, false, true]);
  assert.deepEqual(collapses([band(), band("Lys")], colors), [false, true]);
});

test("blød og solid flade kollapser ikke, selv med samme grundfarve", () => {
  assert.deepEqual(collapses([band("Mørk"), band("Mørk blød")], colors), [false, false]);
});

test("forskellige temaer med samme farve kollapser kun, når farverne kendes", () => {
  assert.deepEqual(collapses([band("Primær"), band("Sekundær")], colors), [false, true]);
  assert.deepEqual(collapses([band("Primær"), band("Sekundær")]), [false, false]);
});

test("aldrig kollaps ind mod et billede", () => {
  assert.deepEqual(collapses([band("Lys"), image_band, band("Lys")], colors), [false, false, false]);
  assert.deepEqual(collapses([cover_hero, band("Lys")], colors), [false, false]);
});

test("joins_footer: siden ender i footerens flade", () => {
  assert.equal(joins_footer([band("Mørk"), band("Lys")], "Lys", colors), true);
  assert.equal(joins_footer([band("Mørk")], "Mørk", colors), true);
  // Tomt tema er lyst, både på slicen og footeren.
  assert.equal(joins_footer([band()], null, colors), true);
});

test("joins_footer: anden flade, billede eller ingen slices", () => {
  assert.equal(joins_footer([band("Lys"), band("Mørk")], "Lys", colors), false);
  assert.equal(joins_footer([band("Primær blød")], "Primær", colors), false);
  assert.equal(joins_footer([cover_hero], "Lys", colors), false);
  assert.equal(joins_footer([image_band], "Lys", colors), false);
  assert.equal(joins_footer([], "Lys", colors), false);
});
