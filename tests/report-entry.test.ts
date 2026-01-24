import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createReportEntry, REPORT_ENTRY_TTL_SECONDS } from "../src/lib/reports";

describe("report entries", () => {
  it("creates a minimal entry for a submission", () => {
    const entry = createReportEntry("submission-123");

    assert.equal(entry.submissionId, "submission-123");
    assert.equal(typeof entry.id, "string");
    assert.ok(entry.id.length > 0);
    assert.ok(Number.isFinite(Date.parse(entry.createdAt)));
  });

  it("uses a bounded retention window", () => {
    assert.equal(REPORT_ENTRY_TTL_SECONDS, 60 * 60 * 24 * 90);
  });
});
