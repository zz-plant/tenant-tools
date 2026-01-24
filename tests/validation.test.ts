import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateSubmissionInput } from "../src/lib/submissions";

const basePayload = {
  building: "2353 W Wabansia",
  issue: "heat",
  stage: "A",
  language: "en",
  portfolio: "continuum",
  startDate: "2024-01-01",
  reportDate: "2024-01-02",
  reportCount: 1,
  simpleEnglish: false,
  zone: "common_area",
  issueDetails: {},
};

describe("submission validation sensitive content checks", () => {
  it("accepts a basic valid payload", () => {
    const result = validateSubmissionInput(basePayload);
    assert.equal(result.ok, true);
  });

  it("rejects unit hints in the building field", () => {
    const result = validateSubmissionInput({ ...basePayload, building: "2353 W Wabansia Apt 2" });
    assert.equal(result.ok, false);
    assert.ok(result.errors.includes("Building: Remove unit numbers."));
  });

  it("rejects phone numbers in details", () => {
    const result = validateSubmissionInput({
      ...basePayload,
      issueDetails: { location: "Call me at 312-555-1212" },
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.includes("Details: Remove phone numbers."));
  });

  it("rejects email addresses in details", () => {
    const result = validateSubmissionInput({
      ...basePayload,
      issueDetails: { location: "Email me at test@example.com" },
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.includes("Details: Remove email addresses."));
  });

  it("allows numeric ticket numbers without phone separators", () => {
    const result = validateSubmissionInput({
      ...basePayload,
      ticketNumber: "2024012345",
    });
    assert.equal(result.ok, true);
  });
});
