import { test } from "node:test";
import assert from "node:assert/strict";

import { find_burst_bots, to_journeys } from "./types";

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

// Mønstret fra 19. nov. kl. 03.23: fem enkeltsidebesøg fra hver sit netværk.
const burst = [
  { visitor: "b1", timestamp: "2026-11-19 03:23:01", source: "", asn: "270355" },
  { visitor: "b2", timestamp: "2026-11-19 03:23:05", source: "", asn: "7738" },
  { visitor: "b3", timestamp: "2026-11-19 03:23:09", source: "", asn: "26599" },
  { visitor: "b4", timestamp: "2026-11-19 03:23:20", source: "", asn: "17639" },
  { visitor: "b5", timestamp: "2026-11-19 03:23:40", source: "", asn: "28573" },
];

test("finder en robot-bølge af enkeltsidebesøg fra hver sit netværk", () => {
  assert.deepEqual([...find_burst_bots(burst)].sort(), ["b1", "b2", "b3", "b4", "b5"]);
});

test("en bølge, der krydser et minutskifte, fanges stadig", () => {
  const rows = [
    { visitor: "x1", timestamp: "2026-11-19 03:23:50", source: "", asn: "1" },
    { visitor: "x2", timestamp: "2026-11-19 03:24:05", source: "", asn: "2" },
    { visitor: "x3", timestamp: "2026-11-19 03:24:20", source: "", asn: "3" },
  ];
  assert.equal(find_burst_bots(rows).size, 3);
});

test("rigtige mønstre tæller ikke som robot", () => {
  const at = (s: number) => `2026-11-19 10:00:${String(s).padStart(2, "0")}`;
  // Via en henvisning (fx et LinkedIn-opslag, der sender mange ind på én gang).
  const via_linkedin = [1, 2, 3].map((n) => ({ visitor: `l${n}`, timestamp: at(n), source: "linkedin.com", asn: String(n) }));
  // Samme netværk, fx et kontor.
  const same_office = [1, 2, 3].map((n) => ({ visitor: `o${n}`, timestamp: at(n), source: "", asn: "3292" }));
  // Klikker videre (flere sider samme besøgskode).
  const browsing = [1, 2, 3].flatMap((n) => [
    { visitor: `k${n}`, timestamp: at(n), source: "", asn: String(n) },
    { visitor: `k${n}`, timestamp: at(n + 30), source: "", asn: String(n) },
  ]);
  // Kun to på et minut.
  const two = burst.slice(0, 2);
  // Spredt over flere minutter.
  const spread = burst.map((r, i) => ({ ...r, timestamp: `2026-11-19 03:${20 + i * 2}:00` }));
  for (const rows of [via_linkedin, same_office, browsing, two, spread]) {
    assert.equal(find_burst_bots(rows).size, 0);
  }
});
