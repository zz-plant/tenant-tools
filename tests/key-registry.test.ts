import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildAccessOverlay,
  closedAccessEnv,
  generateBuildingKey,
  hashBuildingKey,
  listKnownBuildings,
  parseKeyRegistry,
  type KeyRegistry,
} from "../src/lib/access/registry";
import { getBuildingIdsForKey, isBuildingAccessValid, isResidentKeyRecognized } from "../src/lib/access";

const settingsJson = JSON.stringify({ "2400 W Wabansia": "old-2400", "2353 W Wabansia": "key-2353" });

describe("generateBuildingKey", () => {
  it("makes readable, distinct keys", () => {
    const keys = new Set(Array.from({ length: 50 }, generateBuildingKey));
    assert.equal(keys.size, 50);
    for (const key of keys) {
      assert.match(key, /^[A-HJ-NP-Z2-9]{5}-[A-HJ-NP-Z2-9]{5}-[A-HJ-NP-Z2-9]{5}$/);
      assert.ok(!/[01OIL]/.test(key));
    }
  });
});

describe("hashBuildingKey", () => {
  it("ignores case and outer spaces", async () => {
    assert.equal(await hashBuildingKey(" abcde-fghjk-mnpqr "), await hashBuildingKey("ABCDE-FGHJK-MNPQR"));
    assert.notEqual(await hashBuildingKey("ABCDE-FGHJK-MNPQR"), await hashBuildingKey("ABCDE-FGHJK-MNPQS"));
    assert.match(await hashBuildingKey("x"), /^[a-f0-9]{64}$/);
  });
});

describe("parseKeyRegistry", () => {
  it("keeps only valid entries", () => {
    const registry = parseKeyRegistry({
      v: 1,
      buildings: { good: { hash: "a".repeat(64), issuedAt: "2026-10-07T00:00:00Z" }, bad: { hash: "plain-key" } },
    });
    assert.deepEqual(Object.keys(registry.buildings), ["good"]);
    assert.deepEqual(parseKeyRegistry(null).buildings, {});
    assert.deepEqual(parseKeyRegistry({ v: 2 }).buildings, {});
  });
});

describe("buildAccessOverlay", () => {
  const setup = async () => {
    const newKey = "K7QXM-2HRTP-9WCNA";
    const registry: KeyRegistry = {
      v: 1,
      buildings: {
        "2400 W Wabansia": { hash: await hashBuildingKey(newKey), issuedAt: "2026-10-07T00:00:00Z" },
        "1500 N Example": { hash: await hashBuildingKey("NEWBL-DGKEY-22222"), issuedAt: "2026-10-07T00:00:00Z" },
      },
    };
    return { newKey, registry };
  };

  it("lets the new key in and keeps the rotated settings key out", async () => {
    const { newKey, registry } = await setup();
    const presented = [{ key: newKey.toLowerCase(), hash: await hashBuildingKey(newKey) }];
    const overlay = buildAccessOverlay({ settingsJson, registry, presented, sentinel: "unset-x" });
    const env = { BUILDING_KEYS_JSON: JSON.stringify(overlay) };

    assert.equal(isBuildingAccessValid("2400 W Wabansia", newKey.toLowerCase(), env), true);
    assert.deepEqual(getBuildingIdsForKey(newKey.toLowerCase(), env), ["2400 W Wabansia"]);
    assert.equal(overlay["1500 N Example"], "unset-x");
    assert.equal(overlay["2353 W Wabansia"], "key-2353");
  });

  it("stops the old settings key after a rotation", async () => {
    const { registry } = await setup();
    const presented = [{ key: "old-2400", hash: await hashBuildingKey("old-2400") }];
    const overlay = buildAccessOverlay({ settingsJson, registry, presented, sentinel: "unset-y" });
    const env = { BUILDING_KEYS_JSON: JSON.stringify(overlay) };

    assert.equal(isBuildingAccessValid("2400 W Wabansia", "old-2400", env), false);
    assert.equal(isResidentKeyRecognized("old-2400", env), false);
    assert.equal(isBuildingAccessValid("2353 W Wabansia", "key-2353", env), true);
  });

  it("never lets an unmatched registry building fall back to a shared key", async () => {
    const { registry } = await setup();
    const overlay = buildAccessOverlay({ settingsJson: undefined, registry, presented: [], sentinel: "unset-z" });
    const env = { BUILDING_KEYS_JSON: JSON.stringify(overlay), BUILDING_ACCESS_KEY: "shared" };
    assert.equal(isBuildingAccessValid("2400 W Wabansia", "shared", env), false);
    assert.equal(isResidentKeyRecognized("shared", env), false);
  });

  it("lists buildings from settings and the registry", async () => {
    const { registry } = await setup();
    assert.deepEqual(listKnownBuildings(settingsJson, registry), [
      "1500 N Example",
      "2353 W Wabansia",
      "2400 W Wabansia",
    ]);
  });
});

describe("closedAccessEnv", () => {
  it("lets no resident key in when the registry cannot be read", () => {
    const deployEnv = { BUILDING_KEYS_JSON: settingsJson, BUILDING_ACCESS_KEY: "shared" };
    const env = { ...deployEnv, ...closedAccessEnv };
    for (const key of ["old-2400", "key-2353", "shared"]) {
      assert.equal(isBuildingAccessValid("2400 W Wabansia", key, env), false);
      assert.equal(isBuildingAccessValid("2353 W Wabansia", key, env), false);
      assert.equal(isResidentKeyRecognized(key, env), false);
      assert.deepEqual(getBuildingIdsForKey(key, env), []);
    }
  });
});
