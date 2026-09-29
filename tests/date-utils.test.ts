import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatTimelineDate } from "../src/lib/dateUtils";

describe("formatTimelineDate", () => {
  it("keeps the same calendar day for date-only values in any time zone", () => {
    const previous = process.env.TZ;
    try {
      process.env.TZ = "America/Chicago";
      assert.equal(formatTimelineDate("2026-09-03"), "Sep 3, 2026");
      process.env.TZ = "Pacific/Honolulu";
      assert.equal(formatTimelineDate("2026-01-01"), "Jan 1, 2026");
    } finally {
      process.env.TZ = previous;
    }
  });

  it("returns empty and invalid values unchanged", () => {
    assert.equal(formatTimelineDate(""), "");
    assert.equal(formatTimelineDate("not a date"), "not a date");
  });
});
