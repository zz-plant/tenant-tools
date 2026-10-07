import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { POST as createSubmission } from "../src/pages/api/submissions/index";
import { POST as addEvent } from "../src/pages/api/submissions/[id]/events";
import { DELETE as removeKey, POST as issueKey } from "../src/pages/api/steward/keys";
import { GET as exportData } from "../src/pages/api/steward/export";
import { POST as wipe } from "../src/pages/api/steward/wipe";
import { hashBuildingKey, KEY_REGISTRY_KV_KEY, loadKeyRegistry } from "../src/lib/access/registry";
import { csvCell } from "../src/lib/buildingData";
import { formatDate } from "../src/lib/dateUtils";
import { asKv, createMockBucket, createMockKv } from "./helpers/mockKv";

const BUILDING_KEYS_JSON = JSON.stringify({ "2400 W Wabansia": "key-2400", "2353 W Wabansia": "key-2353" });
type Handler = (context: never) => Promise<Response>;

const setup = () => {
  const kv = createMockKv();
  const bucket = createMockBucket();
  const env: Record<string, unknown> = { SUBMISSIONS_KV: kv, BUILDING_KEYS_JSON, STEWARD_KEY: "steward", EVIDENCE_BUCKET: bucket };
  const locals = { runtime: { env } };
  let ip = 0;
  const call = (handler: Handler, url: string, init: { method?: string; body?: unknown; headers?: Record<string, string> } = {}) =>
    handler({
      params: {},
      request: new Request(`http://localhost${url}`, {
        method: init.method ?? "GET",
        headers: { "Content-Type": "application/json", "x-forwarded-for": `4.4.4.${ip++}`, ...(init.headers ?? {}) },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
      }),
      locals,
    } as never);
  const steward = { "x-steward-key": "steward" };

  const createRecord = async (building: string, key: string, issue = "leak") => {
    const response = await call(createSubmission as unknown as Handler, "/api/submissions", {
      method: "POST",
      headers: { "x-building-key": key },
      body: {
        building,
        issue,
        stage: "A",
        language: "en",
        portfolio: "other",
        startDate: "2026-09-01",
        reportDate: "2026-09-02",
        reportCount: 1,
        simpleEnglish: true,
        zone: "",
        issueDetails: { location: "=SUM(A1)" },
      },
    });
    return (JSON.parse(await response.text()) as { id: string }).id;
  };

  const addFact = (id: string, key: string) =>
    (addEvent as unknown as Handler)({
      params: { id },
      request: new Request(`http://localhost/api/submissions/${id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-building-key": key, "x-forwarded-for": `5.5.5.${ip++}` },
        body: JSON.stringify({ type: "entry_offered", date: formatDate(new Date()) }),
      }),
      locals,
    } as never);

  return { kv, bucket, call, steward, createRecord, addFact };
};

const readJson = async (response: Response) => JSON.parse(await response.text());

describe("steward building keys", () => {
  it("issues a key once and stores only its hash", async () => {
    const { kv, call, steward } = setup();
    const response = await call(issueKey as unknown as Handler, "/api/steward/keys", {
      method: "POST",
      headers: steward,
      body: { building: "2400 W Wabansia" },
    });
    assert.equal(response.status, 201);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    const { key } = await readJson(response);
    assert.match(key, /^[A-Z2-9]{5}-[A-Z2-9]{5}-[A-Z2-9]{5}$/);

    const stored = JSON.stringify(await asKv(kv).get(KEY_REGISTRY_KV_KEY, { type: "json" }));
    assert.ok(!stored.includes(key), "the plain key must not be stored");
    const registry = await loadKeyRegistry(asKv(kv), { fresh: true });
    assert.equal(registry.buildings["2400 W Wabansia"].hash, await hashBuildingKey(key));
  });

  it("rotates on a second issue and removes on delete", async () => {
    const { kv, call, steward } = setup();
    const first = await readJson(await call(issueKey as unknown as Handler, "/api/steward/keys", { method: "POST", headers: steward, body: { building: "2400 W Wabansia" } }));
    const second = await readJson(await call(issueKey as unknown as Handler, "/api/steward/keys", { method: "POST", headers: steward, body: { building: "2400 W Wabansia" } }));
    assert.notEqual(first.key, second.key);
    const registry = await loadKeyRegistry(asKv(kv), { fresh: true });
    assert.equal(registry.buildings["2400 W Wabansia"].hash, await hashBuildingKey(second.key));

    const removed = await call(removeKey as unknown as Handler, "/api/steward/keys", { method: "DELETE", headers: steward, body: { building: "2400 W Wabansia" } });
    assert.equal(removed.status, 200);
    assert.deepEqual((await loadKeyRegistry(asKv(kv), { fresh: true })).buildings, {});
    const again = await call(removeKey as unknown as Handler, "/api/steward/keys", { method: "DELETE", headers: steward, body: { building: "2400 W Wabansia" } });
    assert.equal(again.status, 404);
  });

  it("refuses residents and building names with unit numbers", async () => {
    const { call } = setup();
    const resident = await call(issueKey as unknown as Handler, "/api/steward/keys", { method: "POST", headers: { "x-building-key": "key-2400" }, body: { building: "2400 W Wabansia" } });
    assert.equal(resident.status, 403);
    const unit = await call(issueKey as unknown as Handler, "/api/steward/keys", { method: "POST", headers: { "x-steward-key": "steward" }, body: { building: "2400 W Wabansia Apt 3B" } });
    assert.equal(unit.status, 400);
  });
});

describe("steward export", () => {
  it("exports records and facts as JSON and CSV for stewards only", async () => {
    const { call, steward, createRecord, addFact } = setup();
    const id = await createRecord("2400 W Wabansia", "key-2400");
    await createRecord("2353 W Wabansia", "key-2353");
    await addFact(id, "key-2400");

    const json = await call(exportData as unknown as Handler, "/api/steward/export?building=2400%20W%20Wabansia", { headers: steward });
    assert.equal(json.status, 200);
    assert.match(json.headers.get("Content-Disposition") ?? "", /building-ledger-2400-w-wabansia-.*\.json/);
    const data = await readJson(json);
    assert.equal(data.records.length, 1);
    assert.equal(data.records[0].events[0].type, "entry_offered");
    assert.ok(!JSON.stringify(data).includes("metoo"));

    const csv = await call(exportData as unknown as Handler, "/api/steward/export?building=2400%20W%20Wabansia&format=csv", { headers: steward });
    const text = await csv.text();
    assert.equal(csv.headers.get("Content-Type"), "text/csv; charset=utf-8");
    assert.ok(text.startsWith("id,issue,issue_label,status"));
    assert.ok(text.includes("location: =SUM(A1)"), "details are kept, inside a quoted cell");
    assert.ok(text.includes("Resident offered entry for repair or treatment"));

    const resident = await call(exportData as unknown as Handler, "/api/steward/export?building=2400%20W%20Wabansia", { headers: { "x-building-key": "key-2400" } });
    assert.equal(resident.status, 403);
  });

  it("stops spreadsheet formulas in CSV cells", () => {
    assert.equal(csvCell("=SUM(A1)"), "'=SUM(A1)");
    assert.equal(csvCell("@cmd"), "'@cmd");
    assert.equal(csvCell('a "b", c'), '"a ""b"", c"');
  });
});

describe("steward emergency wipe", () => {
  it("needs the exact building name", async () => {
    const { call, steward } = setup();
    const response = await call(wipe as unknown as Handler, "/api/steward/wipe", { method: "POST", headers: steward, body: { building: "2400 W Wabansia", confirm: "2400 w wabansia" } });
    assert.equal(response.status, 400);
  });

  it("deletes one building's data in batches and leaves other buildings", async () => {
    const { kv, bucket, call, steward, createRecord, addFact } = setup();
    const ids: string[] = [];
    for (let index = 0; index < 7; index += 1) {
      ids.push(await createRecord("2400 W Wabansia", "key-2400"));
    }
    const keep = await createRecord("2353 W Wabansia", "key-2353");
    await addFact(ids[0], "key-2400");
    await asKv(kv).put(`metoo:${ids[0]}:abc`, "1");
    await asKv(kv).put(`evidence:${ids[0]}:ev1`, JSON.stringify({ id: "ev1", submissionId: ids[0], objectKey: "ev/one", contentType: "image/jpeg", size: 3, createdAt: "2026-09-02T00:00:00Z" }));
    await bucket.put("ev/one", new Uint8Array([1, 2, 3]));

    let rounds = 0;
    let remaining = true;
    while (remaining && rounds < 10) {
      const response = await call(wipe as unknown as Handler, "/api/steward/wipe", { method: "POST", headers: steward, body: { building: "2400 W Wabansia", confirm: "2400 W Wabansia" } });
      assert.equal(response.status, 200);
      remaining = (await readJson(response)).remaining;
      rounds += 1;
    }
    assert.equal(rounds, 2, "7 records take two batches of up to 5");
    const keys = kv.keys();
    for (const id of ids) {
      assert.ok(!keys.some((key) => key.includes(id)), `left data for ${id}`);
    }
    assert.deepEqual(bucket.keys(), []);
    assert.ok(keys.includes(`submission:${keep}`), "the other building is untouched");
  });
});
