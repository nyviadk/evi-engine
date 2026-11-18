import { test } from "node:test";
import assert from "node:assert/strict";

import { redirect_key } from "./redirect-key";

test("æøå og ae/oe/aa giver samme nøgle", () => {
  assert.equal(redirect_key("/tænk-nyt"), "/taenk-nyt");
  assert.equal(redirect_key("/testforløb"), "/testforloeb");
  assert.equal(redirect_key("/påmindelser"), "/paamindelser");
});

test("store bogstaver tæller ikke", () => {
  assert.equal(redirect_key("/Blog"), "/blog");
  assert.equal(redirect_key("/HJÆLP"), "/hjaelp");
});

test("kombinerende tegn (NFD) normaliseres", () => {
  assert.equal(redirect_key("/påmindelser"), "/paamindelser");
});
