import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canonicalRedirect } from "../src/lib/canonicalHost";

const site = "https://tenants.kanav.net";

describe("canonicalRedirect", () => {
  it("sends the old address to the new one, keeping path and query", () => {
    const result = canonicalRedirect(new URL("https://galina.kanav.net/buildings/2400%20W%20Wabansia?key=abc"), "GET", site);
    assert.deepEqual(result, { location: "https://tenants.kanav.net/buildings/2400%20W%20Wabansia?key=abc", status: 301 });
  });

  it("keeps the method for writes", () => {
    assert.equal(canonicalRedirect(new URL("https://galina.kanav.net/api/submissions"), "POST", site)?.status, 308);
  });

  it("leaves the site's own address and unknown hosts alone", () => {
    assert.equal(canonicalRedirect(new URL("https://tenants.kanav.net/"), "GET", site), null);
    assert.equal(canonicalRedirect(new URL("http://localhost:4321/"), "GET", site), null);
    assert.equal(canonicalRedirect(new URL("https://galina.kanav.net/"), "GET", undefined), null);
  });
});
