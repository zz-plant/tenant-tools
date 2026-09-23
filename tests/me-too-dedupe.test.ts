import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { POST as createSubmission } from "../src/pages/api/submissions/index";
import { POST as reportSubmission } from "../src/pages/api/submissions/[id]/report";
import { hashReporterSession } from "../src/lib/reports";

const BUILDING_KEYS_JSON = JSON.stringify({ "2353 W Wabansia": "key-2353-test" });

const basePayload = {
  building: "2353 W Wabansia",
  issue: "common",
  stage: "A",
  language: "en",
  portfolio: "continuum",
  startDate: "2026-09-01",
  reportDate: "2026-09-02",
  reportCount: 1,
  simpleEnglish: true,
  zone: "entry",
  issueDetails: { commonArea: "door fobs" },
};

const createMockKv = () => {
  const store = new Map<string, string>();
  return {
    async get(key: string, options?: { type?: "json" }) {
      const value = store.get(key);
      if (value === undefined) return null;
      return options?.type === "json" ? JSON.parse(value) : value;
    },
    async put(key: string, value: string) {
      store.set(key, value);
    },
    async list({ prefix }: { prefix: string }) {
      return { keys: [...store.keys()].filter((name) => name.startsWith(prefix)).map((name) => ({ name })), list_complete: true };
    },
    keys: () => [...store.keys()],
  };
};

const setup = async () => {
  const kv = createMockKv();
  const locals = { runtime: { env: { SUBMISSIONS_KV: kv, BUILDING_KEYS_JSON } } };
  const response = await createSubmission({
    request: new Request("http://localhost/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-building-key": "key-2353-test", cookie: "bl_session_id=creator" },
      body: JSON.stringify(basePayload),
    }),
    locals,
  } as unknown as Parameters<typeof createSubmission>[0]);
  const { id } = JSON.parse(await response.text()) as { id: string };
  return { kv, locals, id };
};

const meToo = (id: string, locals: unknown, sessionId: string | null, ip: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-building-key": "key-2353-test",
    "x-forwarded-for": ip,
  };
  if (sessionId) headers.cookie = `bl_session_id=${sessionId}`;
  return reportSubmission({
    params: { id },
    request: new Request(`http://localhost/api/submissions/${id}/report`, {
      method: "POST",
      headers,
      body: JSON.stringify({ increment: 1 }),
    }),
    locals,
  } as unknown as Parameters<typeof reportSubmission>[0]);
};

describe("me too dedupe", () => {
  it("counts one report per session per record", async () => {
    const { locals, id } = await setup();

    const first = JSON.parse(await (await meToo(id, locals, "resident-a", "2.2.2.1")).text());
    assert.equal(first.reportCount, 2);
    assert.equal(first.alreadyReported, false);

    const repeat = await meToo(id, locals, "resident-a", "2.2.2.1");
    assert.equal(repeat.status, 200);
    const repeatPayload = JSON.parse(await repeat.text());
    assert.equal(repeatPayload.reportCount, 2);
    assert.equal(repeatPayload.alreadyReported, true);

    const other = JSON.parse(await (await meToo(id, locals, "resident-b", "2.2.2.2")).text());
    assert.equal(other.reportCount, 3);
  });

  it("rejects reports without a session", async () => {
    const { locals, id } = await setup();
    const response = await meToo(id, locals, null, "2.2.2.3");
    assert.equal(response.status, 400);
  });

  it("stores only a hash of the session id", async () => {
    const { kv, locals, id } = await setup();
    await meToo(id, locals, "resident-secret-session", "2.2.2.4");
    const markers = kv.keys().filter((key) => key.startsWith(`metoo:${id}:`));
    assert.equal(markers.length, 1);
    assert.ok(!markers[0].includes("resident-secret-session"));
    assert.equal(markers[0], `metoo:${id}:${await hashReporterSession(id, "resident-secret-session")}`);
  });

  it("uses a different hash for the same session on different records", async () => {
    assert.notEqual(await hashReporterSession("record-1", "same"), await hashReporterSession("record-2", "same"));
  });
});
