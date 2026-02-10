import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { POST as updateStatus } from "../src/pages/api/submissions/[id]/status";

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
  };
};

const readJson = async (response: Response) => JSON.parse(await response.text());

describe("submission status route", () => {
  it("accepts steward key from header and updates status", async () => {
    const kv = createMockKv();
    const record = {
      id: "sub-1",
      createdAt: new Date().toISOString(),
      building: "2400 W Wabansia",
      issue: "heat",
      issueLabel: "Heat",
      stage: "A",
      language: "en",
      portfolio: "continuum",
      startDate: "2024-01-01",
      reportDate: "2024-01-02",
      reportCount: 2,
      simpleEnglish: true,
      zone: "common_area",
      issueDetails: {},
      status: "open",
    };

    await kv.put(`submission:${record.id}`, JSON.stringify(record));

    const request = new Request(`http://localhost/api/submissions/${record.id}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-steward-key": "steward-secret",
        "x-forwarded-for": "1.1.1.1",
      },
      body: JSON.stringify({ status: "resolved" }),
    });

    const response = await updateStatus({
      params: { id: record.id },
      request,
      locals: {
        runtime: {
          env: {
            SUBMISSIONS_KV: kv,
            STEWARD_KEY: "steward-secret",
          },
        },
      },
    } as Parameters<typeof updateStatus>[0]);

    assert.equal(response.status, 200);
    const payload = await readJson(response);
    assert.equal(payload.status, "resolved");

    const saved = await kv.get(`submission:${record.id}`, { type: "json" });
    assert.equal((saved as { status: string }).status, "resolved");
  });
});
