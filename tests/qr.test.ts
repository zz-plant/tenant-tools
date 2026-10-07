import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { qrSvg } from "../src/lib/qr";

describe("qrSvg", () => {
  it("draws an SVG for a public link", () => {
    const svg = qrSvg("https://example.org/rights");
    assert.ok(svg.startsWith("<svg"));
    assert.ok(svg.includes("viewBox"));
  });

  it("refuses links that hold a key", () => {
    assert.throws(() => qrSvg("https://example.org/buildings/x?key=SECRET"));
    assert.throws(() => qrSvg("https://example.org/steward?stewardKey=SECRET"));
  });
});
