import test from "node:test";
import assert from "node:assert/strict";
import { new_tab_target } from "./links";

test("andre sites og filer åbner i ny fane", () => {
  assert.equal(new_tab_target("https://apps.apple.com/dk/app/x"), "_blank");
  assert.equal(new_tab_target("http://example.com"), "_blank");
  assert.equal(new_tab_target("https://images.prismic.io/repo/fil.pdf"), "_blank");
});

test("egne sider, ankre, mailto og tel bliver i samme fane", () => {
  assert.equal(new_tab_target("/da-dk/privatlivspolitik"), undefined);
  assert.equal(new_tab_target("#kontakt"), undefined);
  assert.equal(new_tab_target("mailto:support@example.com"), undefined);
  assert.equal(new_tab_target("tel:+4512345678"), undefined);
  assert.equal(new_tab_target(undefined), undefined);
});
