import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getBuildingIdsForKey,
  isAccessKeyValid,
  isBuildingAccessValid,
  isResidentKeyRecognized,
  parseBuildingKeys,
} from "../src/lib/access";

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

  it("trims keys before comparing", () => {
    assert.equal(isAccessKeyValid(" secret ", "secret"), true);
  });

  it("returns false when keys do not match", () => {
    assert.equal(isAccessKeyValid("wrong", "secret"), false);
  });
});

describe("building key helpers", () => {
  const BUILDING_KEYS_JSON = JSON.stringify({
    "2400 W Wabansia": "17000",
    "2353 W Wabansia": "16000",
  });

  it("parses building keys safely", () => {
    assert.deepEqual(parseBuildingKeys(BUILDING_KEYS_JSON), {
      "2400 W Wabansia": "17000",
      "2353 W Wabansia": "16000",
    });
    assert.deepEqual(parseBuildingKeys("{"), {});
  });

  it("recognizes resident keys from the mapping", () => {
    const env = { BUILDING_KEYS_JSON };
    assert.equal(isResidentKeyRecognized("17000", env), true);
    assert.equal(isResidentKeyRecognized("16000", env), true);
    assert.equal(isResidentKeyRecognized("99999", env), false);
  });

  it("validates the correct key for each building", () => {
    const env = { BUILDING_KEYS_JSON };
    assert.equal(isBuildingAccessValid("2400 W Wabansia", "17000", env), true);
    assert.equal(isBuildingAccessValid("2400 W Wabansia", "16000", env), false);
  });

  it("falls back to the global key only when a building key is missing", () => {
    const env = { BUILDING_KEYS_JSON, BUILDING_ACCESS_KEY: "fallback" };
    assert.equal(isBuildingAccessValid("2400 W Wabansia", "fallback", env), false);
    assert.equal(isBuildingAccessValid("812 W Adams St", "fallback", env), true);
  });

  it("returns building ids for a given key", () => {
    const envWithMapping = { BUILDING_KEYS_JSON };
    assert.deepEqual(getBuildingIdsForKey("17000", envWithMapping), ["2400 W Wabansia"]);

    const envWithFallback = { BUILDING_ACCESS_KEY: "fallback" };
    assert.deepEqual(getBuildingIdsForKey("fallback", envWithFallback), ["*"]);
  });
});
