import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isAccessKeyValid } from "../src/lib/access";

describe("isAccessKeyValid", () => {
  it("returns false when no required key is set", () => {
    assert.equal(isAccessKeyValid("anything", undefined), false);
  });

  it("returns false when provided key is missing", () => {
    assert.equal(isAccessKeyValid(null, "secret"), false);
  });

  it("returns true when keys match", () => {
    assert.equal(isAccessKeyValid("secret", "secret"), true);
  });

  it("returns false when keys do not match", () => {
    assert.equal(isAccessKeyValid("wrong", "secret"), false);
  });
});
