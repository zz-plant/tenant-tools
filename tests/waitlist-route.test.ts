import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { POST as createWaitlistEntry } from "../src/pages/api/waitlist/index";

type MockKv = ReturnType<typeof createMockKv>;

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

const localsFor = (kv: MockKv) => ({
  runtime: {
    env: {
      WAITLIST_KV: kv,
    },
  },
});

const readJson = async (response: Response) => JSON.parse(await response.text());

describe("waitlist route", () => {
  it("rejects invalid payloads", async () => {
    const kv = createMockKv();
    const request = new Request("http://localhost/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ building: "", portfolio: "invalid" }),
    });

    const response = await createWaitlistEntry({ request, locals: localsFor(kv) } as Parameters<typeof createWaitlistEntry>[0]);
    assert.equal(response.status, 400);

    const payload = await readJson(response);
    assert.ok(Array.isArray(payload.details));
    assert.ok(payload.details.includes("Building address is required."));
    assert.ok(payload.details.includes("Property group is invalid."));
  });

  it("stores valid entries", async () => {
    const kv = createMockKv();
    const request = new Request("http://localhost/api/waitlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "9.9.9.9",
      },
      body: JSON.stringify({ building: "2400 W Wabansia", portfolio: "continuum" }),
    });

    const response = await createWaitlistEntry({ request, locals: localsFor(kv) } as Parameters<typeof createWaitlistEntry>[0]);
    assert.equal(response.status, 201);
    const payload = await readJson(response);
    assert.ok(typeof payload.id === "string");
  });

  it("rate limits repeated requests from the same IP", async () => {
    const kv = createMockKv();
    const locals = localsFor(kv);

    for (let index = 0; index < 4; index += 1) {
      const request = new Request("http://localhost/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "7.7.7.7",
        },
        body: JSON.stringify({ building: `2400 W Wabansia ${index}`, portfolio: "continuum" }),
      });
      const response = await createWaitlistEntry({ request, locals } as Parameters<typeof createWaitlistEntry>[0]);
      assert.equal(response.status, 201);
    }

    const blockedRequest = new Request("http://localhost/api/waitlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "7.7.7.7",
      },
      body: JSON.stringify({ building: "2400 W Wabansia", portfolio: "continuum" }),
    });
    const blockedResponse = await createWaitlistEntry({ request: blockedRequest, locals } as Parameters<typeof createWaitlistEntry>[0]);
    assert.equal(blockedResponse.status, 429);
    assert.ok(blockedResponse.headers.get("Retry-After"));
  });

  it("uses CF-Connecting-IP when present and does not trust alternate headers for bypass", async () => {
    const kv = createMockKv();
    const locals = localsFor(kv);

    for (let index = 0; index < 4; index += 1) {
      const request = new Request("http://localhost/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CF-Connecting-IP": "5.5.5.5",
          "x-forwarded-for": `6.6.6.${index}`,
        },
        body: JSON.stringify({ building: `2400 W Wabansia ${index}`, portfolio: "continuum" }),
      });
      const response = await createWaitlistEntry({ request, locals } as Parameters<typeof createWaitlistEntry>[0]);
      assert.equal(response.status, 201);
    }

    const blockedRequest = new Request("http://localhost/api/waitlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Connecting-IP": "5.5.5.5",
        "x-real-ip": "8.8.8.8",
      },
      body: JSON.stringify({ building: "2400 W Wabansia", portfolio: "continuum" }),
    });
    const blockedResponse = await createWaitlistEntry({ request: blockedRequest, locals } as Parameters<typeof createWaitlistEntry>[0]);
    assert.equal(blockedResponse.status, 429);
  });

  it("rejects malformed JSON payloads", async () => {
    const kv = createMockKv();
    const request = new Request("http://localhost/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{\"building\":\"2400 W Wabansia\",\"portfolio\":",
    });

    const response = await createWaitlistEntry({ request, locals: localsFor(kv) } as Parameters<typeof createWaitlistEntry>[0]);
    assert.equal(response.status, 400);

    const payload = await readJson(response);
    assert.ok(Array.isArray(payload.details));
    assert.ok(payload.details.includes("Payload must be an object."));
  });
});
