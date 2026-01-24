import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  detectSensitiveContent,
  getSensitiveContentMessages,
  sanitizeLimitedText,
} from "../src/lib/validation";

describe("sanitizeLimitedText", () => {
  it("trims whitespace before enforcing the limit", () => {
    const result = sanitizeLimitedText("  hallway leak  ", 7);
    assert.equal(result, "hallway");
  });

  it("returns an empty string for whitespace-only input", () => {
    const result = sanitizeLimitedText("   ", 5);
    assert.equal(result, "");
  });
});

describe("detectSensitiveContent", () => {
  it("detects email, phone, and unit hints", () => {
    const flags = detectSensitiveContent("Email me at test@example.com in Apt 2B or call 312-555-1212.");
    assert.deepEqual(flags.sort(), ["email", "phone", "unit"]);
  });

  it("deduplicates repeated flags", () => {
    const flags = detectSensitiveContent("apt 1A and Apt 2B");
    assert.deepEqual(flags, ["unit"]);
  });
});

describe("getSensitiveContentMessages", () => {
  it("returns human-readable messages for each detected flag", () => {
    const messages = getSensitiveContentMessages("Contact: test@example.com");
    assert.deepEqual(messages, ["Remove email addresses."]);
  });
});
