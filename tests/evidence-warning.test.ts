import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evidenceSafetyChecklist, evidenceSafetySummary } from "../src/components/noticeBuilder/constants";

describe("evidence warning copy", () => {
  it("includes required metadata warnings", () => {
    const combined = `${evidenceSafetySummary} ${evidenceSafetyChecklist.join(" ")}`.toLowerCase();
    assert.equal(combined.includes("faces"), true);
    assert.equal(combined.includes("names"), true);
    assert.equal(combined.includes("mail labels"), true);
    assert.equal(combined.includes("unit"), true);
    assert.equal(combined.includes("leases"), true);
  });
});
