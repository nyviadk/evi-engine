import test from "node:test";
import assert from "node:assert/strict";
import { og_locale } from "./og-locale";

test("og_locale: Prismic-locale til Open Graph-format", () => {
  assert.equal(og_locale("da-dk"), "da_DK");
  assert.equal(og_locale("en-eu"), "en_EU");
  assert.equal(og_locale("en-GB"), "en_GB");
  assert.equal(og_locale("da"), "da");
});
