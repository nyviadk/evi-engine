import test from "node:test";
import assert from "node:assert/strict";
import { hex_to_hsv, hsv_to_hex, parse_hex } from "./planio-color";

test("parse_hex normaliserer og afviser ugyldige koder", () => {
  assert.equal(parse_hex("#00c6b4"), "#00C6B4");
  assert.equal(parse_hex("8c7bd1"), "#8C7BD1");
  assert.equal(parse_hex(" #abc "), "#AABBCC");
  assert.equal(parse_hex("#12345"), null);
  assert.equal(parse_hex("#GGGGGG"), null);
  assert.equal(parse_hex(""), null);
});

test("HEX → HSV → HEX giver samme farve", () => {
  for (const hex of ["#00C6B4", "#8C7BD1", "#FBF6EE", "#2E2A3A", "#FD7239", "#000000", "#FFFFFF", "#FF0000"]) {
    assert.equal(hsv_to_hex(hex_to_hsv(hex)), hex);
  }
});

test("rene farver har den forventede farvetone", () => {
  assert.equal(hex_to_hsv("#FF0000").h, 0);
  assert.equal(hex_to_hsv("#00FF00").h, 120);
  assert.equal(hex_to_hsv("#0000FF").h, 240);
});

test("grå beholder den forrige farvetone", () => {
  const gray = hex_to_hsv("#808080", 252);
  assert.equal(gray.h, 252);
  assert.equal(gray.s, 0);
  assert.equal(hex_to_hsv("#000000", 30).h, 30);
});

test("mætning og lysstyrke i hjørnerne", () => {
  assert.equal(hsv_to_hex({ h: 200, s: 0, v: 1 }), "#FFFFFF");
  assert.equal(hsv_to_hex({ h: 200, s: 1, v: 0 }), "#000000");
  assert.equal(hsv_to_hex({ h: 0, s: 1, v: 1 }), "#FF0000");
});
