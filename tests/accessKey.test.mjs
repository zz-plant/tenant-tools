import assert from "node:assert/strict";
import test from "node:test";
import { enforceAccessKey, validateAccessKey } from "../src/lib/accessKey.js";

const makeRequest = (url = "https://example.com/submissions/123", headers = {}) =>
  new Request(url, { headers });

test("validateAccessKey rejects when config is missing", () => {
  const request = makeRequest();
  const result = validateAccessKey(request, {});
  assert.deepEqual(result, { ok: false, reason: "missing-config" });
});

test("validateAccessKey rejects when key is missing", () => {
  const request = makeRequest();
  const result = validateAccessKey(request, { BUILDING_ACCESS_KEY: "alpha" });
  assert.deepEqual(result, { ok: false, reason: "missing-key" });
});

test("validateAccessKey rejects when key is invalid", () => {
  const request = makeRequest("https://example.com/submissions/123?access_key=beta");
  const result = validateAccessKey(request, { BUILDING_ACCESS_KEY: "alpha" });
  assert.deepEqual(result, { ok: false, reason: "invalid-key" });
});

test("validateAccessKey accepts a valid header key", () => {
  const request = makeRequest("https://example.com/submissions/123", {
    "x-building-access-key": "alpha",
  });
  const result = validateAccessKey(request, { BUILDING_ACCESS_KEY: "alpha" });
  assert.deepEqual(result, { ok: true });
});

test("enforceAccessKey returns a 403 response when invalid", () => {
  const request = makeRequest();
  const result = enforceAccessKey(request, { BUILDING_ACCESS_KEY: "alpha" });
  assert.equal(result.ok, false);
  assert.equal(result.response.status, 403);
});
