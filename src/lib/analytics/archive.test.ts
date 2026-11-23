import { test } from "node:test";
import assert from "node:assert/strict";

import { days_to_archive, to_archive_row } from "./archive";

const now = Date.parse("2026-11-23T10:00:00Z");

test("arkiverer kun hele døgn, til og med i går", () => {
  const days = days_to_archive(now, new Set());
  assert.equal(days.at(-1), "2026-11-22");
  assert.equal(days.length, 89);
});

test("springer arkiverede døgn over", () => {
  const days = days_to_archive(now, new Set(["2026-11-21", "2026-11-22"]));
  assert.equal(days.at(-1), "2026-11-20");
  assert.ok(!days.includes("2026-11-21"));
});

test("en række får dag, repo og alle felter i fast rækkefølge", () => {
  const row = to_archive_row({
    timestamp: "2026-11-22 20:44:08", repo: "myplanio", b1: "www.myplanio.com", b2: "prod",
    b3: "/da-dk", b4: "google.com", b5: "", b6: "DK", b7: "mobile", b8: "abc", b9: "da-dk",
    b10: "3292", b11: "TDC", si: 1,
  });
  assert.deepEqual(row, [
    "2026-11-22 20:44:08", "2026-11-22", "myplanio", "www.myplanio.com", "prod", "/da-dk",
    "google.com", "", "DK", "mobile", "abc", "da-dk", "3292", "TDC", 1,
  ]);
});

test("manglende samplingsfaktor tæller som 1", () => {
  assert.equal(to_archive_row({ timestamp: "2026-11-22 01:00:00" }).at(-1), 1);
});
