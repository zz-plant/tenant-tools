import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { POST as createSubmission } from "../src/pages/api/submissions/index";
import { GET as getSubmission } from "../src/pages/api/submissions/[id]";

type MockKv = ReturnType<typeof createMockKv>;

const BUILDING_KEYS_JSON = JSON.stringify({
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
    async list({ prefix, limit = 50 }: { prefix: string; cursor?: string; limit?: number }) {
      const keys = Array.from(store.keys())
        .filter((name) => name.startsWith(prefix))
        .slice(0, limit)
        .map((name) => ({ name }));
      return { keys, list_complete: true };
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

describe("cookie auth and session-aware rate limiting", () => {
  it("accepts resident key from cookie on protected routes", async () => {
    const kv = createMockKv();
    const locals = localsFor(kv);

    const createRequest = new Request("http://localhost/api/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: "bl_resident_key=key-2353-test; bl_session_id=session-a",
        "x-forwarded-for": "1.1.1.1",
      },
      body: JSON.stringify(basePayload),
    });

    const createResponse = await createSubmission({ request: createRequest, locals } as Parameters<typeof createSubmission>[0]);
    assert.equal(createResponse.status, 201);
    const created = await readJson(createResponse);

    const getRequest = new Request(`http://localhost/api/submissions/${created.id}`, {
      method: "GET",
      headers: {
        cookie: "bl_resident_key=key-2353-test",
      },
    });

    const getResponse = await getSubmission({ params: { id: created.id }, request: getRequest, locals } as Parameters<typeof getSubmission>[0]);
    assert.equal(getResponse.status, 200);
  });

  it("rate limits repeated writes when session id stays the same across IP changes", async () => {
    const kv = createMockKv();
    const locals = localsFor(kv);

    let lastStatus = 0;
    for (let attempt = 0; attempt < 7; attempt += 1) {
      const request = new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: "bl_resident_key=key-2353-test; bl_session_id=session-sticky",
          "x-forwarded-for": `1.1.1.${attempt + 1}`,
        },
        body: JSON.stringify(basePayload),
      });
      const response = await createSubmission({ request, locals } as Parameters<typeof createSubmission>[0]);
      lastStatus = response.status;
    }

    assert.equal(lastStatus, 429);
  });

  it("does not throttle unrelated sessions that share a resident access key", async () => {
    const kv = createMockKv();
    const locals = localsFor(kv);

    let rateLimited = false;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const request = new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: "bl_resident_key=key-2353-test; bl_session_id=session-heavy",
          "x-forwarded-for": "9.9.9.9",
        },
        body: JSON.stringify(basePayload),
      });
      const response = await createSubmission({ request, locals } as Parameters<typeof createSubmission>[0]);
      if (response.status === 429) {
        rateLimited = true;
        break;
      }
    }

    assert.equal(rateLimited, true);

    const separateResidentRequest = new Request("http://localhost/api/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: "bl_resident_key=key-2353-test; bl_session_id=session-fresh",
        "x-forwarded-for": "8.8.8.8",
      },
      body: JSON.stringify(basePayload),
    });

    const separateResidentResponse = await createSubmission({
      request: separateResidentRequest,
      locals,
    } as Parameters<typeof createSubmission>[0]);

    assert.equal(separateResidentResponse.status, 201);
  });
});
