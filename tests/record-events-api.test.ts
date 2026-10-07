import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { POST as createSubmission } from "../src/pages/api/submissions/index";
import { DELETE as removeEvent, POST as addEvent } from "../src/pages/api/submissions/[id]/events";
import { POST as addReport } from "../src/pages/api/submissions/[id]/report";
import { formatDate } from "../src/lib/dateUtils";
import { maxRecordEvents } from "../src/lib/recordEvents";
import { listRecordEvents } from "../src/lib/storage/recordEvents";
import { fetchSubmissionRecord, saveSubmissionRecord } from "../src/lib/storage/submissions";
import { asKv, createMockKv } from "./helpers/mockKv";

const BUILDING_KEYS_JSON = JSON.stringify({ "2400 W Wabansia": "key-2400", "2353 W Wabansia": "key-2353" });
const today = formatDate(new Date());

const setup = async () => {
  const kv = createMockKv();
  const env: Record<string, unknown> = { SUBMISSIONS_KV: kv, BUILDING_KEYS_JSON, STEWARD_KEY: "steward" };
  const locals = { runtime: { env } };
  let ip = 0;
  // A new IP for each call keeps the per-IP rate limit out of tests that are not about it.
  const nextIp = () => `9.9.${Math.floor(ip / 250)}.${ip++ % 250}`;

  const created = await createSubmission({
    request: new Request("http://localhost/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-building-key": "key-2400", "x-forwarded-for": nextIp() },
      body: JSON.stringify({
        building: "2400 W Wabansia",
        issue: "leak",
        stage: "A",
        language: "en",
        portfolio: "other",
        startDate: "2026-09-01",
        reportDate: "2026-09-02",
        reportCount: 1,
        simpleEnglish: true,
        zone: "hallway",
        issueDetails: {},
      }),
    }),
    locals,
  } as unknown as Parameters<typeof createSubmission>[0]);
  const id = (JSON.parse(await created.text()) as { id: string }).id;

  const add = (body: unknown, key: string | null = "key-2400", ipAddress = nextIp()) => {
    const headers: Record<string, string> = { "Content-Type": "application/json", "x-forwarded-for": ipAddress };
    if (key) headers["x-building-key"] = key;
    return addEvent({
      params: { id },
      request: new Request(`http://localhost/api/submissions/${id}/events`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }),
      locals,
    } as unknown as Parameters<typeof addEvent>[0]);
  };

  const remove = (eventId: string, stewardKey: string | null = "steward") => {
    const headers: Record<string, string> = { "Content-Type": "application/json", "x-forwarded-for": nextIp() };
    if (stewardKey) headers["x-steward-key"] = stewardKey;
    return removeEvent({
      params: { id },
      request: new Request(`http://localhost/api/submissions/${id}/events`, {
        method: "DELETE",
        headers,
        body: JSON.stringify({ eventId }),
      }),
      locals,
    } as unknown as Parameters<typeof removeEvent>[0]);
  };

  return { kv, id, add, remove, locals, nextIp };
};

const readJson = async (response: Response) => JSON.parse(await response.text());

describe("POST /api/submissions/:id/events", () => {
  it("adds a dated fact for a resident of the building", async () => {
    const { kv, id, add } = await setup();
    const response = await add({ type: "portal_marked_complete", date: today, ref: "WO-77" });
    assert.equal(response.status, 201);
    const body = await readJson(response);
    assert.equal(body.event.type, "portal_marked_complete");
    assert.equal(body.event.ref, "WO-77");
    assert.match(body.event.id, /^[a-f0-9]{16}$/);

    const stored = await listRecordEvents(asKv(kv), id);
    assert.deepEqual(stored, [body.event]);
  });

  it("requires a resident key for the record's building", async () => {
    const { add } = await setup();
    assert.equal((await add({ type: "entry_offered", date: today }, null)).status, 403);
    assert.equal((await add({ type: "entry_offered", date: today }, "wrong-key")).status, 403);
    assert.equal((await add({ type: "entry_offered", date: today }, "key-2353")).status, 404);
  });

  it("rejects invalid facts with a reason", async () => {
    const { add } = await setup();
    const past = await add({ type: "management_replied", date: "2099-01-01" });
    assert.equal(past.status, 400);
    assert.equal((await readJson(past)).error, "This date cannot be in the future.");
    const deadline = await add({ type: "reply_due", date: "2099-01-01" });
    assert.equal(deadline.status, 400);
    assert.equal((await readJson(deadline)).error, "This date is too far in the future.");
    assert.equal((await add({ type: "anything", date: today })).status, 400);
    assert.equal((await add({ type: "inspection_done", date: today, ref: "call 773-555-0100" })).status, 400);
  });

  it("rate limits repeated writes from one address", async () => {
    const { add } = await setup();
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 9; attempt += 1) {
      statuses.push((await add({ type: "entry_offered", date: today }, "key-2400", "5.5.5.5")).status);
    }
    assert.deepEqual(statuses.slice(0, 8), Array(8).fill(201));
    assert.equal(statuses[8], 429);
  });

  it("stops at the fact limit", async () => {
    const { id, kv, add } = await setup();
    for (let index = 0; index < maxRecordEvents; index += 1) {
      await asKv(kv).put(`revt:${id}:${index.toString(16).padStart(16, "0")}`, "{}", {
        metadata: { type: "entry_offered", date: "2026-09-10" },
      });
    }
    assert.equal((await add({ type: "entry_offered", date: today })).status, 409);
  });

  it("refuses facts on a merged duplicate", async () => {
    const { id, kv, add } = await setup();
    const record = await fetchSubmissionRecord(asKv(kv), id);
    assert.ok(record);
    await saveSubmissionRecord(asKv(kv), { ...record, mergedInto: "main-record", status: "archived" });
    const response = await add({ type: "entry_offered", date: today });
    assert.equal(response.status, 409);
    assert.equal((await readJson(response)).mergedInto, "main-record");
  });

  it("keeps facts when a me too tap rewrites the record", async () => {
    const { id, kv, add, locals, nextIp } = await setup();
    await add({ type: "entry_offered", date: today });
    const report = await addReport({
      params: { id },
      request: new Request(`http://localhost/api/submissions/${id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-building-key": "key-2400",
          "x-session-id": "session-a",
          "x-forwarded-for": nextIp(),
        },
        body: JSON.stringify({ increment: 1 }),
      }),
      locals,
    } as unknown as Parameters<typeof addReport>[0]);
    assert.equal(report.status, 200);
    assert.equal((await listRecordEvents(asKv(kv), id)).length, 1);
  });
});

describe("DELETE /api/submissions/:id/events", () => {
  it("lets a steward remove a fact", async () => {
    const { kv, id, add, remove } = await setup();
    const { event } = await readJson(await add({ type: "entry_offered", date: today }));
    const response = await remove(event.id);
    assert.equal(response.status, 200);
    assert.deepEqual(await listRecordEvents(asKv(kv), id), []);
  });

  it("refuses residents and unknown facts", async () => {
    const { add, remove } = await setup();
    const { event } = await readJson(await add({ type: "entry_offered", date: today }));
    assert.equal((await remove(event.id, null)).status, 403);
    assert.equal((await remove(event.id, "key-2400")).status, 403);
    assert.equal((await remove("0000000000000000")).status, 404);
    assert.equal((await remove("not-an-id")).status, 400);
  });
});
