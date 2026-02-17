import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { POST as createSubmission } from "../src/pages/api/submissions/index";
import { POST as updateStatus } from "../src/pages/api/submissions/[id]/status";
import { POST as reportSubmission } from "../src/pages/api/submissions/[id]/report";

const BUILDING_KEYS_JSON = JSON.stringify({ "2353": "key-2353-test" });

const createMockKv = () => {
  const store = new Map<string, string>();

  return {
    async get(key: string, options?: { type?: "json" }) {
      const value = store.get(key);
      if (value === undefined) {
        return null;
      }
      if (options?.type === "json") {
        return JSON.parse(value);
      }
      return value;
    },
    async put(key: string, value: string) {
      store.set(key, value);
    },
    keys() {
      return [...store.keys()];
    },
  };
};

const basePayload = {
  building: "2353",
  issue: "heat",
  stage: "A",
  language: "en",
  portfolio: "continuum",
  startDate: "2024-01-01",
  reportDate: "2024-01-02",
  reportCount: 1,
  simpleEnglish: true,
  zone: "common_area",
  issueDetails: {},
};

const readJson = async (response: Response) => JSON.parse(await response.text());

describe("audit event logging", () => {
  it("writes an audit event for each write operation", async () => {
    const kv = createMockKv();
    const locals = {
      runtime: {
        env: {
          SUBMISSIONS_KV: kv,
          BUILDING_KEYS_JSON,
          STEWARD_KEY: "steward-secret",
        },
      },
    };

    const createResponse = await createSubmission({
      request: new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-building-key": "key-2353-test",
          "x-forwarded-for": "1.1.1.1",
        },
        body: JSON.stringify(basePayload),
      }),
      locals,
    } as Parameters<typeof createSubmission>[0]);
    assert.equal(createResponse.status, 201);
    const created = await readJson(createResponse);

    const statusResponse = await updateStatus({
      params: { id: created.id as string },
      request: new Request(`http://localhost/api/submissions/${created.id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-steward-key": "steward-secret",
          "x-forwarded-for": "1.1.1.2",
        },
        body: JSON.stringify({ status: "resolved" }),
      }),
      locals,
    } as Parameters<typeof updateStatus>[0]);
    assert.equal(statusResponse.status, 200);

    const reportResponse = await reportSubmission({
      params: { id: created.id as string },
      request: new Request(`http://localhost/api/submissions/${created.id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-building-key": "key-2353-test",
          "x-forwarded-for": "1.1.1.3",
        },
        body: JSON.stringify({ increment: 1 }),
      }),
      locals,
    } as Parameters<typeof reportSubmission>[0]);
    assert.equal(reportResponse.status, 200);

    const auditKeys = kv.keys().filter((key) => key.startsWith("audit:"));
    assert.equal(auditKeys.length, 3);
  });

  it("records rejected audit events for blocked writes", async () => {
    const kv = createMockKv();
    const locals = {
      runtime: {
        env: {
          SUBMISSIONS_KV: kv,
          BUILDING_KEYS_JSON,
          STEWARD_KEY: "steward-secret",
        },
      },
    };

    const blockedResponse = await createSubmission({
      request: new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "2.2.2.2",
        },
        body: JSON.stringify(basePayload),
      }),
      locals,
    } as Parameters<typeof createSubmission>[0]);

    assert.equal(blockedResponse.status, 403);

    const auditEvents = await Promise.all(
      kv
        .keys()
        .filter((key) => key.startsWith("audit:"))
        .map((key) => kv.get(key, { type: "json" }))
    );

    assert.equal(auditEvents.length, 1);
    assert.equal((auditEvents[0] as { outcome: string }).outcome, "rejected");
    assert.equal((auditEvents[0] as { action: string }).action, "submission.create");
  });

});
