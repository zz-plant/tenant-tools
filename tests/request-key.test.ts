import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getRequestKey } from "../src/lib/http";

describe("request key propagation", () => {
  it("reads resident key from query params for permalink workflows", () => {
    const request = new Request("http://localhost/submissions/123?key=query-key");
    assert.equal(getRequestKey(request, "x-building-key", "key"), "query-key");
  });

  it("prefers explicit header key for dashboard write actions", () => {
    const request = new Request("http://localhost/api/submissions/123/report?key=query-key", {
      headers: {
        "x-building-key": "header-key",
      },
    });
    assert.equal(getRequestKey(request, "x-building-key", "key"), "header-key");
  });
});
