import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { POST as createSubmission } from "../src/pages/api/submissions/index";
import { GET as getSubmission } from "../src/pages/api/submissions/[id]";
import { POST as reportSubmission } from "../src/pages/api/submissions/[id]/report";

type MockKv = ReturnType<typeof createMockKv>;

const BUILDING_KEYS_JSON = JSON.stringify({
  "2400 W Wabansia": "key-2400-test",
  "2353 W Wabansia": "key-2353-test",
});

const basePayload = {
  building: "2353 W Wabansia",
  issue: "heat",
  stage: "A",
  language: "en",
  portfolio: "continuum",
  startDate: "2024-01-01",
  reportDate: "2024-01-02",
  reportCount: 1,
  simpleEnglish: false,
  zone: "common_area",
  issueDetails: {},
};

const createMockKv = () => {
  const store = new Map<string, string>();
  let getCalls = 0;

  return {
    async get(key: string, options?: { type?: "json" }) {
      getCalls += 1;
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
    async list({ prefix, limit = 50 }: { prefix: string; cursor?: string; limit?: number }) {
      const keys = Array.from(store.keys())
        .filter((name) => name.startsWith(prefix))
        .slice(0, limit)
        .map((name) => ({ name }));
      return { keys, list_complete: true };
    },
    getCallCount() {
      return getCalls;
    },
  };
};

const localsFor = (kv: MockKv) => ({
  runtime: {
    env: {
      SUBMISSIONS_KV: kv,
      BUILDING_KEYS_JSON,
    },
  },
});

const readJson = async (response: Response) => JSON.parse(await response.text());

describe("resident key gating on submission routes", () => {
  it("requires a valid building key to create, view, and report", async () => {
    const kv = createMockKv();
    const locals = localsFor(kv);

    const missingKeyRequest = new Request("http://localhost/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "1.1.1.1" },
      body: JSON.stringify(basePayload),
    });
    const missingKeyResponse = await createSubmission({ request: missingKeyRequest, locals } as Parameters<typeof createSubmission>[0]);
    assert.equal(missingKeyResponse.status, 403);

    const wrongKeyRequest = new Request("http://localhost/api/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-building-key": "key-2400-test",
        "x-forwarded-for": "1.1.1.1",
      },
      body: JSON.stringify(basePayload),
    });
    const wrongKeyResponse = await createSubmission({ request: wrongKeyRequest, locals } as Parameters<typeof createSubmission>[0]);
    assert.equal(wrongKeyResponse.status, 403);

    const validKeyRequest = new Request("http://localhost/api/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-building-key": "key-2353-test",
        "x-forwarded-for": "1.1.1.1",
      },
      body: JSON.stringify(basePayload),
    });
    const validKeyResponse = await createSubmission({ request: validKeyRequest, locals } as Parameters<typeof createSubmission>[0]);
    assert.equal(validKeyResponse.status, 201);
    const createdPayload = await readJson(validKeyResponse);
    assert.ok(typeof createdPayload.id === "string");
    assert.ok(String(createdPayload.url).includes("?key=key-2353-test"));

    const submissionId = createdPayload.id as string;
    const invalidKeyGetCount = kv.getCallCount();
    const invalidKeyRequest = new Request(`http://localhost/api/submissions/${submissionId}?key=99999`, {
      method: "GET",
    });
    const invalidKeyResponse = await getSubmission({ params: { id: submissionId }, request: invalidKeyRequest, locals } as Parameters<typeof getSubmission>[0]);
    assert.equal(invalidKeyResponse.status, 403);
    assert.equal(kv.getCallCount(), invalidKeyGetCount);

    const otherBuildingRequest = new Request(`http://localhost/api/submissions/${submissionId}?key=key-2400-test`, {
      method: "GET",
    });
    const otherBuildingResponse = await getSubmission({ params: { id: submissionId }, request: otherBuildingRequest, locals } as Parameters<typeof getSubmission>[0]);
    assert.equal(otherBuildingResponse.status, 404);

    const correctBuildingRequest = new Request(`http://localhost/api/submissions/${submissionId}?key=key-2353-test`, {
      method: "GET",
    });
    const correctBuildingResponse = await getSubmission({ params: { id: submissionId }, request: correctBuildingRequest, locals } as Parameters<typeof getSubmission>[0]);
    assert.equal(correctBuildingResponse.status, 200);

    const missingKeyReportRequest = new Request(`http://localhost/api/submissions/${submissionId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ increment: 1 }),
    });
    const missingKeyReportResponse = await reportSubmission({ params: { id: submissionId }, request: missingKeyReportRequest, locals } as Parameters<typeof reportSubmission>[0]);
    assert.equal(missingKeyReportResponse.status, 403);

    const otherBuildingReportRequest = new Request(`http://localhost/api/submissions/${submissionId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-building-key": "key-2400-test" },
      body: JSON.stringify({ increment: 1 }),
    });
    const otherBuildingReportResponse = await reportSubmission({ params: { id: submissionId }, request: otherBuildingReportRequest, locals } as Parameters<typeof reportSubmission>[0]);
    assert.equal(otherBuildingReportResponse.status, 404);

    const invalidIncrementRequest = new Request(`http://localhost/api/submissions/${submissionId}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-building-key": "key-2353-test",
      },
      body: JSON.stringify({ increment: 1.5 }),
    });
    const invalidIncrementResponse = await reportSubmission({ params: { id: submissionId }, request: invalidIncrementRequest, locals } as Parameters<typeof reportSubmission>[0]);
    assert.equal(invalidIncrementResponse.status, 400);

    const queryKeyReportRequest = new Request(`http://localhost/api/submissions/${submissionId}/report?key=key-2353-test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "1.1.1.2",
      },
      body: JSON.stringify({ increment: 1 }),
    });
    const queryKeyReportResponse = await reportSubmission({ params: { id: submissionId }, request: queryKeyReportRequest, locals } as Parameters<typeof reportSubmission>[0]);
    assert.equal(queryKeyReportResponse.status, 200);

    const correctBuildingReportRequest = new Request(`http://localhost/api/submissions/${submissionId}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-building-key": "key-2353-test",
        "x-forwarded-for": "1.1.1.1",
      },
      body: JSON.stringify({ increment: 1 }),
    });
    const correctBuildingReportResponse = await reportSubmission({ params: { id: submissionId }, request: correctBuildingReportRequest, locals } as Parameters<typeof reportSubmission>[0]);
    assert.equal(correctBuildingReportResponse.status, 200);
    const reportPayload = await readJson(correctBuildingReportResponse);
    assert.equal(reportPayload.reportCount, 3);
  });
});
