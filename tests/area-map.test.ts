import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { areaMapMinimumRecords, buildAreaMap, type AreaMapRecord } from "../src/lib/areaMap";

const record = (overrides: Partial<AreaMapRecord>): AreaMapRecord => ({
  issue: "heat",
  zone: "unit_interior",
  reportCount: 1,
  status: "open",
  ...overrides,
});

const area = (map: ReturnType<typeof buildAreaMap>, zone: string) => map.areas.find((entry) => entry.zone === zone);

describe("buildAreaMap", () => {
  const records = [
    record({ issue: "heat", reportCount: 6 }),
    record({ issue: "pests", reportCount: 2 }),
    record({ issue: "heat", reportCount: 1 }),
    record({ issue: "leak", zone: "hallway", reportCount: 4 }),
    record({ issue: "access", zone: "entry", reportCount: 1 }),
    record({ issue: "leak", zone: "", reportCount: 2 }),
    record({ issue: "leak", zone: "unknown", reportCount: 3 }),
    record({ issue: "pests", zone: "hallway", status: "resolved", reportCount: 9 }),
    record({ issue: "pests", zone: "hallway", mergedInto: "x", reportCount: 9 }),
  ];

  it("counts reports by area and problem type, with all units in one group", () => {
    const map = buildAreaMap(records);
    assert.equal(map.show, true);
    assert.deepEqual(area(map, "unit_interior")?.items, [
      { issue: "heat", count: "7" },
      { issue: "pests", count: "<3" },
    ]);
    assert.deepEqual(area(map, "hallway")?.items, [{ issue: "leak", count: "4" }]);
    assert.deepEqual(area(map, "entry")?.items, [{ issue: "access", count: "<3" }]);
    assert.deepEqual(area(map, "common_area")?.items, []);
  });

  it("counts records with no area or 'Not sure' as not listed", () => {
    assert.equal(buildAreaMap(records).notListed, "5");
    assert.equal(buildAreaMap([record({ zone: "" })]).notListed, "<3");
  });

  it("has no area totals and no floor or unit fields", () => {
    const map = buildAreaMap(records);
    map.areas.forEach((entry) => assert.deepEqual(Object.keys(entry).sort(), ["items", "label", "letter", "zone"]));
  });

  it("keeps problem types in a fixed order, so the order does not rank small counts", () => {
    const map = buildAreaMap([
      record({ issue: "pests", reportCount: 2 }),
      record({ issue: "heat", reportCount: 1 }),
      record({ issue: "leak", reportCount: 1 }),
    ]);
    assert.deepEqual(area(map, "unit_interior")?.items.map((item) => item.issue), ["heat", "leak", "pests"]);
  });

  it(`is hidden until ${areaMapMinimumRecords} open records list an area`, () => {
    const two = [record({}), record({ zone: "hallway" }), record({ zone: "" }), record({ zone: "unknown" })];
    assert.equal(buildAreaMap(two).show, false);
    assert.equal(buildAreaMap([...two, record({ zone: "entry" })]).show, true);
  });

  it("counts each record at least once", () => {
    const map = buildAreaMap([record({ reportCount: 0 }), record({ reportCount: 0 }), record({ reportCount: 1 })]);
    assert.deepEqual(area(map, "unit_interior")?.items, [{ issue: "heat", count: "3" }]);
  });
});
