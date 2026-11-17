import test from "node:test";
import assert from "node:assert/strict";
import { local_date, short_date } from "./date";

test("local_date: Prismic-tidspunkt i sitets tidszone", () => {
  assert.equal(local_date("2026-11-11T18:57:49+0000", "Europe/Copenhagen"), "2026-11-11");
  // Om sommeren er København UTC+2, så 23:30 UTC er næste dag.
  assert.equal(local_date("2026-07-06T23:30:00+0000", "Europe/Copenhagen"), "2026-07-07");
});

test("short_date: kort dansk form", () => {
  assert.equal(short_date("2026-11-11"), "11/11-2026");
  assert.equal(short_date("2026-07-07"), "07/07-2026");
});
