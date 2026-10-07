import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { describeCanvass, latestCanvassCount, validateCanvassInput, type Canvass } from "../src/lib/canvass";
import { buildBuildingLetter } from "../src/lib/buildingLetter";
import { DELETE as removeCanvass, POST as saveCanvass } from "../src/pages/api/buildings/canvass";
import { GET as exportData } from "../src/pages/api/steward/export";
import { listCanvasses } from "../src/lib/storage/canvass";
import { asKv, createMockKv } from "./helpers/mockKv";

const today = "2026-10-07";

describe("validateCanvassInput", () => {
  it("accepts counts for known problems and drops zeros", () => {
    const result = validateCanvassInput({ date: today, householdsReached: 24, tallies: { pests: 9, heat: 0, leak: 2 } }, today);
    assert.deepEqual(result, { ok: true, data: { date: today, householdsReached: 24, tallies: { pests: 9, leak: 2 } } });
  });

  it("rejects bad input", () => {
    const bad = [
      { date: "2026-10-30", householdsReached: 5, tallies: { pests: 1 } },
      { date: today, householdsReached: -1, tallies: { pests: 1 } },
      { date: today, householdsReached: 5, tallies: { pests: 1.5 } },
      { date: today, householdsReached: 5, tallies: { mold: 1 } },
      { date: today, householdsReached: 5, tallies: { pests: 6 } },
      { date: today, householdsReached: 5, tallies: { pests: 0 } },
      { date: today, householdsReached: 5, tallies: { pests: 1 }, note: "apt 3" },
    ];
    for (const input of bad.slice(0, 6)) {
      assert.equal(validateCanvassInput(input, today).ok, false, JSON.stringify(input));
    }
    // Extra fields are ignored, never stored.
    const extra = validateCanvassInput(bad[6], today);
    assert.ok(extra.ok && !("note" in extra.data));
  });

  it("rejects counts when no households were reached", () => {
    const result = validateCanvassInput({ date: today, householdsReached: 0, tallies: { pests: 5 } }, today);
    assert.deepEqual(result, { ok: false, message: "Add how many households you reached." });
  });
});

describe("canvass helpers", () => {
  const canvasses: Canvass[] = [
    { id: "b", date: "2026-10-07", householdsReached: 24, tallies: { pests: 9, leak: 2 } },
    { id: "a", date: "2026-09-01", householdsReached: 10, tallies: { heat: 6 } },
  ];

  it("describes counts with small counts bucketed", () => {
    assert.equal(
      describeCanvass(canvasses[0]),
      "Oct 7, 2026: 24 households reached. Pests (roaches / rats / bedbugs): 9. Water leak / ceiling leak / water damage: <3."
    );
  });

  it("finds the latest count for a problem type", () => {
    assert.deepEqual(latestCanvassCount(canvasses, "pests"), { date: "2026-10-07", count: 9 });
    assert.deepEqual(latestCanvassCount(canvasses, "heat"), { date: "2026-09-01", count: 6 });
    assert.equal(latestCanvassCount(canvasses, "entry"), null);
  });

  it("adds canvass counts of 3 or more to the letter", () => {
    const letter = buildBuildingLetter({
      building: "2400 W Wabansia",
      today,
      issues: [
        { id: "1", label: "Pests", startDate: "2026-09-01", reportCount: 1, canvass: { date: "2026-10-07", count: 9 } },
        { id: "2", label: "Water leak", startDate: "2026-09-01", reportCount: 1, canvass: { date: "2026-10-07", count: 2 } },
      ],
      households: 0,
      replyBy: "2026-10-21",
      copyTo: [],
      simple: false,
    });
    assert.ok(letter.includes("A canvass on Oct 7, 2026 counted 9 households with this problem."));
    assert.ok(!letter.includes("counted 2 households"));
  });
});

describe("canvass API", () => {
  const setup = () => {
    const kv = createMockKv();
    const locals = { runtime: { env: { SUBMISSIONS_KV: kv, STEWARD_KEY: "steward", BUILDING_KEYS_JSON: JSON.stringify({ "2400 W Wabansia": "key-2400" }) } } };
    let ip = 0;
    const call = (handler: (context: never) => Promise<Response>, method: string, body: unknown, headers: Record<string, string>, url = "/api/buildings/canvass") =>
      handler({
        params: {},
        request: new Request(`http://localhost${url}`, {
          method,
          headers: { "Content-Type": "application/json", "x-forwarded-for": `6.6.6.${ip++}`, ...headers },
          body: body === undefined ? undefined : JSON.stringify(body),
        }),
        locals,
      } as never);
    return { kv, call };
  };

  it("lets stewards save and remove a canvass, and residents cannot", async () => {
    const { kv, call } = setup();
    const date = new Date().toISOString().slice(0, 10);
    const body = { building: "2400 W Wabansia", date, householdsReached: 12, tallies: { pests: 5 } };
    assert.equal((await call(saveCanvass as never, "POST", body, { "x-building-key": "key-2400" })).status, 403);

    const saved = await call(saveCanvass as never, "POST", body, { "x-steward-key": "steward" });
    assert.equal(saved.status, 201);
    const { canvass } = JSON.parse(await saved.text());
    assert.deepEqual((await listCanvasses(asKv(kv), "2400 W Wabansia")).map((entry) => entry.id), [canvass.id]);
    assert.ok(kv.keys().every((key) => !key.includes("Wabansia")), "keys never show the address");

    const exported = await call(exportData as never, "GET", undefined, { "x-steward-key": "steward" }, "/api/steward/export?building=2400%20W%20Wabansia");
    assert.equal(JSON.parse(await exported.text()).canvasses[0].tallies.pests, 5);

    const removed = await call(removeCanvass as never, "DELETE", { building: "2400 W Wabansia", canvassId: canvass.id }, { "x-steward-key": "steward" });
    assert.equal(removed.status, 200);
    assert.deepEqual(await listCanvasses(asKv(kv), "2400 W Wabansia"), []);
  });
});
