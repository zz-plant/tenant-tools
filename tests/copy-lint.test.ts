import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { lintSimpleNoticeTemplates, lintVerySimpleEnglish } from "../src/lib/copyLint";

describe("lintVerySimpleEnglish", () => {
  it("flags idioms and pressure language", () => {
    const result = lintVerySimpleEnglish(
      "Heads up. We will circle back and name and shame if this is not fixed."
    );

    assert.equal(result.ok, false);
    assert.deepEqual(result.warnings, ["Avoid idioms. Use literal words.", "Avoid pressuring language."]);
  });

  it("accepts short literal copy", () => {
    const result = lintVerySimpleEnglish(
      "The issue started on 2026-02-01. Please share the repair date and timeline."
    );
    assert.equal(result.ok, true);
    assert.deepEqual(result.warnings, []);
  });
});

describe("simple notice templates", () => {
  it("keep current simple English templates clear of blocked phrases", () => {
    const results = lintSimpleNoticeTemplates();
    const failing = results.filter((entry) => !entry.ok);
    assert.deepEqual(failing, []);
  });
});
