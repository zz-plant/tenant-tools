import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  detectSensitiveContent,
  detectSoftContentWarnings,
  getSensitiveContentMessages,
  getSoftContentWarningMessages,
  isValidDateString,
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

describe("soft warning detection", () => {
  it("flags name hints and accusation terms", () => {
    const flags = detectSoftContentWarnings("Mr Smith said this is a scam.");
    assert.deepEqual(flags.sort(), ["accusation", "name_hint"]);
  });

  it("returns warning messages", () => {
    const messages = getSoftContentWarningMessages("This is illegal.");
    assert.deepEqual(messages, ["Avoid accusation terms. Write only observable facts."]);
  });
});

describe("getSensitiveContentMessages", () => {
  it("returns human-readable messages for each detected flag", () => {
    const messages = getSensitiveContentMessages("Contact: test@example.com");
    assert.deepEqual(messages, ["Remove email addresses."]);
  });
});

describe("isValidDateString", () => {
  it("accepts valid calendar dates", () => {
    assert.equal(isValidDateString("2026-02-28"), true);
    assert.equal(isValidDateString("2024-02-29"), true);
  });

  it("rejects impossible calendar dates", () => {
    assert.equal(isValidDateString("2026-02-31"), false);
    assert.equal(isValidDateString("2026-13-01"), false);
    assert.equal(isValidDateString("2026-00-10"), false);
  });
});
