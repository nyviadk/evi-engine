import { test } from "node:test";
import assert from "node:assert/strict";

import { to_journeys } from "./types";

// Rækker kommer nyeste først, som fra Analytics Engine.
const rows = [
  { visitor: "b", timestamp: "2026-11-18 20:47:08", page_path: "/da-dk/download", country: "DK", device: "mobile", network: "Norlys", source: "" },
  { visitor: "a", timestamp: "2026-11-18 20:46:00", page_path: "/en-eu", country: "MX", device: "desktop", network: "UNINET", source: "" },
  { visitor: "b", timestamp: "2026-11-18 20:46:28", page_path: "/da-dk/univers/nyheder", country: "DK", device: "mobile", network: "Norlys", source: "" },
  { visitor: "b", timestamp: "2026-11-18 20:45:14", page_path: "/", country: "DK", device: "mobile", network: "Norlys", source: "linkedin.com" },
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
