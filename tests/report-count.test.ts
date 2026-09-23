import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { reconcileReportCount, resolveBaseReportCount } from "../src/lib/domain/submissions";
import { parseSubmissionRecord, type SubmissionRecord } from "../src/lib/submissions";

const baseRecord: SubmissionRecord = {
  id: "r1",
  building: "2400 W Wabansia",
  issue: "common",
  issueLabel: "Elevator / common areas",
  stage: "A",
  language: "en",
  portfolio: "other",
  startDate: "2026-09-01",
  reportDate: "2026-09-02",
  reportCount: 1,
  simpleEnglish: true,
  zone: "",
  issueDetails: {},
  createdAt: "2026-09-02T00:00:00.000Z",
  status: "open",
  baseReportCount: 1,
};

describe("report count reconciliation", () => {
  it("rebuilds the count from base, merged, and markers", () => {
    const stale = { ...baseRecord, reportCount: 2, mergedReportCount: 3 };
    // Three markers exist, but a concurrent write left the stored count at 2.
    assert.equal(reconcileReportCount(stale, 3).reportCount, 1 + 3 + 3);
  });

  it("derives a base for older records without double counting markers", () => {
    const legacy = { ...baseRecord, baseReportCount: undefined, reportCount: 6 };
    assert.equal(resolveBaseReportCount(legacy, 2), 4);
    assert.equal(reconcileReportCount(legacy, 2).reportCount, 6);
  });

  it("never returns a negative base", () => {
    const odd = { ...baseRecord, baseReportCount: undefined, reportCount: 1 };
    assert.equal(resolveBaseReportCount(odd, 5), 0);
  });
});

describe("parseSubmissionRecord", () => {
  it("rejects values without an id", () => {
    assert.equal(parseSubmissionRecord(null), null);
    assert.equal(parseSubmissionRecord({ building: "x" }), null);
  });

  it("fills safe defaults for older or partial records", () => {
    const parsed = parseSubmissionRecord({
      id: "old",
      building: "2400 W Wabansia",
      issue: "heat",
      reportCount: "3",
      status: "bogus",
      zone: "not-a-zone",
      issueDetails: { temp: "60", bad: 5 },
    });
    assert.ok(parsed);
    assert.equal(parsed.status, "open");
    assert.equal(parsed.reportCount, 3);
    assert.equal(parsed.zone, "");
    assert.equal(parsed.stage, "A");
    assert.deepEqual(parsed.issueDetails, { temp: "60" });
    assert.ok(parsed.issueLabel.includes("heat") || parsed.issueLabel.length > 0);
    assert.equal(parsed.baseReportCount, undefined);
  });
});
