import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildIssuePatterns,
  lastMonths,
  patternLevel,
  repeatPatternLines,
  type PatternInput,
} from "../src/lib/issuePatterns";
import { heatSeasonSpanInMonth } from "../src/data/rules";
import { lintVerySimpleEnglish } from "../src/lib/copyLint";

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
      levels: ["none", "none", "none", "none", "some", "few"],
      activeMonths: 2,
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

describe("patternLevel", () => {
  it("paints none, under 3, 3 to 5, and 6 or more", () => {
    assert.deepEqual([0, 1, 2, 3, 5, 6, 40].map(patternLevel), ["none", "few", "few", "some", "some", "many", "many"]);
  });
});

describe("repeatPatternLines", () => {
  const label = (issue: string) => (issue === "leak" ? "Water leak" : "Pests");

  it("lists problem types that started in at least 3 months, most months first, as plain facts", () => {
    const lines = repeatPatternLines(
      [
        { issue: "pests", activeMonths: 3 },
        { issue: "leak", activeMonths: 5 },
        { issue: "heat", activeMonths: 2 },
      ],
      6,
      label
    );
    assert.deepEqual(lines.map((line) => line.text), [
      "Water leak: started in 5 of the last 6 months.",
      "Pests: started in 3 of the last 6 months.",
    ]);
    lines.forEach((line) => assert.equal(lintVerySimpleEnglish(line.text).ok, true));
  });

  it("shows at most 3 lines", () => {
    const rows = ["a", "b", "c", "d"].map((issue) => ({ issue, activeMonths: 4 }));
    assert.equal(repeatPatternLines(rows, 6, (issue) => issue).length, 3);
  });
});

describe("heatSeasonSpanInMonth", () => {
  it("covers the part of each month that is heat season", () => {
    assert.deepEqual(heatSeasonSpanInMonth("2026-10"), { from: 0, to: 100 });
    assert.deepEqual(heatSeasonSpanInMonth("2026-09"), { from: 46.7, to: 100 });
    assert.deepEqual(heatSeasonSpanInMonth("2026-06"), { from: 0, to: 3.3 });
    assert.equal(heatSeasonSpanInMonth("2026-07"), null);
    assert.equal(heatSeasonSpanInMonth("bad"), null);
  });
});
