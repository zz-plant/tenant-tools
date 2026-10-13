import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { POST as createSubmission } from "../src/pages/api/submissions/index";
import { enforceRateLimit, rateLimitBindingName } from "../src/lib/rateLimit";
import { securityHeaders, withSecurityHeaders } from "../src/lib/securityHeaders";
import { failureLogLine } from "../src/lib/requestLog";

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
    store,
    async get(key: string, options?: { type?: "json" }) {
      const value = store.get(key);
      if (value === undefined) {
        return null;
      }
      return options?.type === "json" ? JSON.parse(value) : value;
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

const submit = (env: Record<string, unknown>) =>
  createSubmission({
    request: new Request("http://localhost/api/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: "bl_resident_key=key-2353; bl_session_id=session-a",
        "x-forwarded-for": "1.1.1.1",
      },
      body: JSON.stringify(basePayload),
    }),
    locals: { runtime: { env } },
  } as unknown as Parameters<typeof createSubmission>[0]);

describe("rate limiting on Cloudflare", () => {
  it("uses the Rate Limiting binding for the route's limit and writes no KV counters", async () => {
    const kv = createMockKv();
    const keys: string[] = [];
    let allow = true;
    const env = {
      SUBMISSIONS_KV: kv,
      BUILDING_KEYS_JSON: JSON.stringify({ "2353 W Wabansia": "key-2353" }),
      RATE_LIMIT_6_PER_MINUTE: {
        limit: async ({ key }: { key: string }) => {
          keys.push(key);
          return { success: allow };
        },
      },
    };

    assert.equal((await submit(env)).status, 201);
    assert.deepEqual(keys, ["rate:submission:ip:1.1.1.1", "rate:submission:session:session-a"]);
    assert.ok(![...kv.store.keys()].some((key) => key.startsWith("rate:")), "no KV rate counters");

    allow = false;
    const limited = await submit(env);
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get("Retry-After"), "60");
  });

  it("lets the request through when the binding fails", async () => {
    const env = {
      SUBMISSIONS_KV: createMockKv(),
      BUILDING_KEYS_JSON: JSON.stringify({ "2353 W Wabansia": "key-2353" }),
      RATE_LIMIT_6_PER_MINUTE: {
        limit: async () => {
          throw new Error("unavailable");
        },
      },
    };
    assert.equal((await submit(env)).status, 201);
  });

  it("does not fail a request when KV refuses a second write to the same counter", async () => {
    const kv = {
      get: async () => ({ count: 1, resetAt: Date.now() + 60_000 }),
      put: async () => {
        throw new Error("KV PUT failed: 429 Too Many Requests");
      },
    };
    assert.deepEqual(await enforceRateLimit({ kv, key: "rate:x", limit: 5, windowMs: 60_000 }), { ok: true });
  });

  it("has a wrangler binding for every per-minute limit a route uses", () => {
    const config = JSON.parse(
      readFileSync("wrangler.jsonc", "utf8").replace(/^\s*\/\/.*$/gm, "")
    ) as { ratelimits: Array<{ name: string; namespace_id: string; simple: { limit: number; period: number } }> };
    const bindings = new Map(config.ratelimits.map((entry) => [entry.name, entry]));
    config.ratelimits.forEach((entry) => {
      assert.equal(entry.simple.period, 60);
      assert.equal(entry.name, rateLimitBindingName(entry.simple.limit, 60_000));
    });
    assert.equal(new Set(config.ratelimits.map((entry) => entry.namespace_id)).size, config.ratelimits.length);

    const routeFiles = (dir: string): string[] =>
      readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        return statSync(path).isDirectory() ? routeFiles(path) : path.endsWith(".ts") ? [path] : [];
      });
    const limits = routeFiles("src/pages/api").flatMap((path) =>
      [...readFileSync(path, "utf8").matchAll(/limit:\s*(\d+),\s*windowMs:\s*60_000/g)].map((match) => Number(match[1]))
    );
    assert.ok(limits.length > 10);
    limits.forEach((limit) => assert.ok(bindings.has(`RATE_LIMIT_${limit}_PER_MINUTE`), `missing binding for ${limit}/min`));
  });
});

describe("security headers", () => {
  it("adds the headers and keeps a route's own CSP", () => {
    const page = withSecurityHeaders(new Response("ok"));
    Object.entries(securityHeaders).forEach(([name, value]) => assert.equal(page.headers.get(name), value));

    const evidence = withSecurityHeaders(
      new Response("img", { headers: { "Content-Security-Policy": "default-src 'none'; sandbox" } })
    );
    assert.equal(evidence.headers.get("Content-Security-Policy"), "default-src 'none'; sandbox");
    assert.equal(evidence.headers.get("X-Frame-Options"), "DENY");
  });

  it("copies a response whose headers are read-only", () => {
    const redirect = withSecurityHeaders(Response.redirect("https://example.org/", 302));
    assert.equal(redirect.status, 302);
    assert.equal(redirect.headers.get("Location"), "https://example.org/");
    assert.equal(redirect.headers.get("X-Content-Type-Options"), "nosniff");
  });
});

describe("failure log line", () => {
  it("has the route pattern and a short error, never a URL", () => {
    const line = failureLogLine({
      route: "/buildings/[id]",
      method: "GET",
      status: 500,
      error: new TypeError("x".repeat(500)),
    });
    const parsed = JSON.parse(line);
    assert.equal(parsed.route, "/buildings/[id]");
    assert.equal(parsed.status, 500);
    assert.equal(parsed.error.length, 200);
    assert.ok(parsed.error.startsWith("TypeError: "));
    assert.ok(!line.includes("http"));
  });
});
