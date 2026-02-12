import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatPublicReadonlyCount, formatResidentReportCount } from "../src/lib/buildingDashboard";

describe("resident report count formatting", () => {
  it("shows 0 for invalid and non-positive values", () => {
    assert.equal(formatResidentReportCount(0), "0");
    assert.equal(formatResidentReportCount(-1), "0");
    assert.equal(formatResidentReportCount(Number.NaN), "0");
  });

  it("buckets small counts to reduce identity risk", () => {
    assert.equal(formatResidentReportCount(1), "<3");
    assert.equal(formatResidentReportCount(2), "<3");
  });

  it("shows whole numbers for larger counts", () => {
    assert.equal(formatResidentReportCount(3), "3");
    assert.equal(formatResidentReportCount(8.9), "8");
  });
});


describe("public-readonly count suppression", () => {
  it("suppresses small counts for privacy", () => {
    assert.equal(formatPublicReadonlyCount(1), "Not shown");
    assert.equal(formatPublicReadonlyCount(2), "Not shown");
  });

  it("shows whole numbers when counts are large enough", () => {
    assert.equal(formatPublicReadonlyCount(3), "3");
    assert.equal(formatPublicReadonlyCount(7.8), "7");
  });
});
