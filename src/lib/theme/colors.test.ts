import { test } from "node:test";
import assert from "node:assert/strict";

import { contrast_between, mix_oklch } from "./colors";

// Facit: Chromes color-mix(in oklch, <farve> 10%, <base>).
test("mix_oklch giver samme farve som browserens color-mix", () => {
  assert.equal(mix_oklch("#F9F9F9", "#00C6B4", 0.1), "#e8f4f2");
  assert.equal(mix_oklch("#FAFAFA", "#0C6170", 0.1), "#e3eaec");
  assert.equal(mix_oklch("#FAFAFA", "#7A6A63", 0.1), "#edebea");
});

test("contrast_between er symmetrisk og følger WCAG", () => {
  assert.equal(contrast_between("#000000", "#FFFFFF"), 21);
  assert.equal(
    contrast_between("#20272E", "#F9F9F9").toFixed(1),
    contrast_between("#F9F9F9", "#20272E").toFixed(1),
  );
});
