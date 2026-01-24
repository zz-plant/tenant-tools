import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isValidSubmissionStatus, normalizeSubmissionStatus } from "../src/lib/submissions";

describe("submission status helpers", () => {
  it("accepts valid statuses", () => {
    assert.equal(isValidSubmissionStatus("open"), true);
    assert.equal(isValidSubmissionStatus("resolved"), true);
    assert.equal(isValidSubmissionStatus("archived"), true);
  });

  it("rejects invalid statuses", () => {
    assert.equal(isValidSubmissionStatus("pending"), false);
    assert.equal(isValidSubmissionStatus(""), false);
  });

  it("normalizes missing status to open", () => {
    assert.equal(normalizeSubmissionStatus(undefined), "open");
  });
});
