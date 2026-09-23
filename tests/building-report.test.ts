import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildBuildingReport, daysBetween } from "../src/lib/buildingReport";
import type { SubmissionRecord } from "../src/lib/submissions";

const record = (overrides: Partial<SubmissionRecord>): SubmissionRecord => ({
  id: "x",
  building: "2400 W Wabansia",
  issue: "common",
  issueLabel: "🛗 Elevator / common areas",
  stage: "A",
  language: "en",
  portfolio: "other",
  startDate: "2026-09-01",
  reportDate: "2026-09-02",
  reportCount: 1,
  simpleEnglish: true,
  zone: "unit_interior",
  issueDetails: { commonArea: "door fobs near unit 3B" },
  createdAt: "2026-09-02T00:00:00.000Z",
  status: "open",
  ...overrides,
});

describe("daysBetween", () => {
  it("counts whole days and rejects invalid dates", () => {
    assert.equal(daysBetween("2026-09-01", "2026-09-23"), 22);
    assert.equal(daysBetween("", "2026-09-23"), null);
    assert.equal(daysBetween("2026-09-30", "2026-09-23"), 0);
  });
});

describe("buildBuildingReport", () => {
  const report = buildBuildingReport(
    "2400 W Wabansia",
    [
      record({ id: "newer", startDate: "2026-09-20", reportCount: 7, evidenceCount: 2, ticketNumber: "SR26-1" }),
      record({ id: "older", startDate: "2026-08-01", reportCount: 2 }),
      record({ id: "fixed", status: "resolved" }),
      record({ id: "dup", mergedInto: "older", status: "archived" }),
      record({ id: "elsewhere", building: "2353 W Wabansia" }),
    ],
    "2026-09-23"
  );

  it("sorts open issues by days open and keeps closed ones separate", () => {
    assert.deepEqual(report.open.map((row) => row.id), ["older", "newer"]);
    assert.deepEqual(report.closed.map((row) => row.id), ["fixed"]);
    assert.equal(report.open[0].daysOpen, 53);
  });

  it("buckets small counts, strips emoji, and keeps tickets and evidence counts", () => {
    assert.equal(report.open[0].reports, "<3");
    assert.equal(report.open[1].reports, "7");
    assert.equal(report.open[1].evidenceOnFile, 2);
    assert.equal(report.open[1].ticketNumber, "SR26-1");
    assert.equal(report.open[0].issueLabel, "Elevator / common areas");
  });

  it("leaves out free text, zones, merged duplicates, and other buildings", () => {
    const serialized = JSON.stringify(report);
    assert.ok(!serialized.includes("3B"));
    assert.ok(!serialized.includes("unit_interior"));
    assert.ok(!serialized.includes("\"dup\""));
    assert.ok(!serialized.includes("elsewhere"));
    assert.ok(report.notes.includes("Resident-reported. Not verified."));
  });
});
