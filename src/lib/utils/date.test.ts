import test from "node:test";
import assert from "node:assert/strict";
import { local_date, long_date, short_date } from "./date";

test("long_date: dato skrevet ud på sidens sprog", () => {
  assert.equal(long_date("2026-11-17", "da-dk"), "17. november 2026");
  assert.equal(long_date("2026-11-17", "en-eu"), "17 November 2026");
  assert.equal(long_date("2026-01-01", "da-dk"), "1. januar 2026");
});

test("local_date: Prismic-tidspunkt i sitets tidszone", () => {
  assert.equal(local_date("2026-11-11T18:57:49+0000", "Europe/Copenhagen"), "2026-11-11");
  // Om sommeren er København UTC+2, så 23:30 UTC er næste dag.
  assert.equal(local_date("2026-07-06T23:30:00+0000", "Europe/Copenhagen"), "2026-07-07");
});

test("short_date: kort dansk form", () => {
  assert.equal(short_date("2026-11-11"), "11/11-2026");
  assert.equal(short_date("2026-07-07"), "07/07-2026");
});
