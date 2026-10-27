import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { LineStop, LineStopState } from "../src/lib/followUp";
import { buildLineMap, describeLine, isLineMapStopKey, isOpenAtStop, type LineMapInput } from "../src/lib/lineMap";
import { lintVerySimpleEnglish } from "../src/lib/copyLint";

const ids = ["start", "notice", "follow-up", "final", "311", "fixed"];
const labels = ["Started", "Notice", "Follow-up", "Final", "311", "Fixed"];

const line = (states: LineStopState[], cityStop: "311" | "ward" = "311"): LineStop[] =>
  states.map((state, index) => ({
    id: index === 4 ? cityStop : ids[index],
    label: index === 4 && cityStop === "ward" ? "Ward" : labels[index],
    state,
  }));

const row = (id: string, states: LineStopState[], cityStop: "311" | "ward" = "311"): LineMapInput => ({
  id,
  issue: "heat",
  label: "Heat",
  daysOpen: 10,
  line: line(states, cityStop),
});

describe("buildLineMap", () => {
  const rows = [
    row("a", ["done", "done", "done", "open", "open", "later"]),
    row("b", ["done", "open", "later", "later", "later", "later"]),
    row("c", ["done", "done", "locked", "later", "later", "later"]),
  ];

  it("makes a column a link only when a problem can take that step now", () => {
    const map = buildLineMap(rows);
    assert.deepEqual(
      map.columns.map((column) => `${column.key}:${column.hasOpen}`),
      ["start:false", "notice:true", "follow-up:false", "final:true", "311:true", "fixed:false"]
    );
  });

  it("keeps lines in the order given and says how many are left off", () => {
    const map = buildLineMap(rows, 2);
    assert.deepEqual(map.lines.map((entry) => entry.id), ["a", "b"]);
    assert.equal(map.more, 1);
  });

  it("names the city column for ward office lines", () => {
    const ward = row("w", ["done", "done", "done", "done", "open", "later"], "ward");
    assert.equal(buildLineMap([ward]).columns[4].label, "Ward");
    assert.equal(buildLineMap([ward, rows[0]]).columns[4].label, "311 / Ward");
    assert.equal(buildLineMap(rows).columns[4].label, "311");
    assert.ok(isOpenAtStop(ward.line, "311"));
  });

  it("describes each line in plain words, with no counts of people", () => {
    const text = describeLine(rows[0].line);
    assert.equal(text, "3 of 6 steps done. Open now: Final, 311.");
    assert.equal(describeLine(rows[2].line), "2 of 6 steps done.");
    assert.equal(lintVerySimpleEnglish(text).ok, true);
  });
});

describe("isLineMapStopKey", () => {
  it("accepts only the six step keys", () => {
    assert.equal(isLineMapStopKey("final"), true);
    assert.equal(isLineMapStopKey("FINAL"), false);
    assert.equal(isLineMapStopKey(null), false);
    assert.equal(isLineMapStopKey("../x"), false);
  });
});
