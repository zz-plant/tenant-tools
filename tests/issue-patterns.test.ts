import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildIssuePatterns, lastMonths, type PatternInput } from "../src/lib/issuePatterns";

const record = (overrides: Partial<PatternInput>): PatternInput => ({
  issue: "leak",
  issueLabel: "Water leak / ceiling leak / water damage",
  startDate: "2026-09-10",
  createdAt: "2026-09-10T00:00:00.000Z",
  status: "open",
  ...overrides,
});

describe("lastMonths", () => {
  it("ends with the current month and crosses the year", () => {
    assert.deepEqual(
      lastMonths("2026-02-15", 4).map((month) => month.label),
      ["Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026"]
    );
  });
});

describe("buildIssuePatterns", () => {
  it("counts records per month by issue and hides counts under 3", () => {
    const records = [
      record({ startDate: "2026-09-01" }),
      record({ startDate: "2026-09-15" }),
      record({ startDate: "2026-09-20", status: "resolved" }),
      record({ startDate: "2026-10-01" }),
      record({ issue: "pests", issueLabel: "Pests (roaches / rats / bedbugs)", startDate: "2026-08-01" }),
      record({ startDate: "2026-01-01" }),
      record({ startDate: "2026-10-02", mergedInto: "other" }),
    ];
    const { months, rows } = buildIssuePatterns(records, "2026-10-07");
    assert.deepEqual(months.map((month) => month.key), ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"]);
    assert.deepEqual(rows[0], {
      issue: "leak",
      issueLabel: "Water leak / ceiling leak / water damage",
      counts: ["0", "0", "0", "0", "3", "<3"],
      total: "4",
      open: "3",
      totalCount: 4,
    });
    assert.equal(rows[1].issue, "pests");
    assert.equal(rows[1].total, "<3");
    assert.equal(rows.length, 2);
  });

  it("uses the created date when the start date is missing", () => {
    const { rows } = buildIssuePatterns([record({ startDate: "", createdAt: "2026-10-03T10:00:00.000Z" })], "2026-10-07");
    assert.equal(rows[0].counts.at(-1), "<3");
  });
});
