import { test } from "node:test";
import assert from "node:assert/strict";

import { to_journeys } from "./types";

// Rækker kommer nyeste først, som fra Analytics Engine.
const rows = [
  { h: "b", t: "2026-11-18 20:47:08", p: "/da-dk/download", c: "DK", d: "mobile", n: "Norlys", r: "" },
  { h: "a", t: "2026-11-18 20:46:00", p: "/en-eu", c: "MX", d: "desktop", n: "UNINET", r: "" },
  { h: "b", t: "2026-11-18 20:46:28", p: "/da-dk/univers/nyheder", c: "DK", d: "mobile", n: "Norlys", r: "" },
  { h: "b", t: "2026-11-18 20:45:14", p: "/", c: "DK", d: "mobile", n: "Norlys", r: "linkedin.com" },
];

test("samler sider pr. besøgende i rækkefølge, nyeste besøgende først", () => {
  const j = to_journeys(rows, 30);
  assert.equal(j.length, 2);
  assert.deepEqual(
    j[0]?.pages.map((p) => p.path),
    ["/", "/da-dk/univers/nyheder", "/da-dk/download"],
  );
  assert.equal(j[0]?.referrer, "linkedin.com");
  assert.equal(j[1]?.network, "UNINET");
});

test("respekterer grænsen for antal besøgende", () => {
  assert.equal(to_journeys(rows, 1).length, 1);
});
