import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { QUICK_EXIT_DESTINATION, QUICK_EXIT_PATH, resolveForgetRedirect } from "../src/lib/quickExit";

describe("resolveForgetRedirect", () => {
  it("leaves the site and clears the session on quick exit", () => {
    const result = resolveForgetRedirect(new URL(`http://localhost${QUICK_EXIT_PATH}`));
    assert.deepEqual(result, { location: QUICK_EXIT_DESTINATION, clearSession: true });
    assert.ok(QUICK_EXIT_DESTINATION.startsWith("https://"));
  });

  it("stays on the page and removes key parameters on forget", () => {
    const result = resolveForgetRedirect(new URL("http://localhost/submissions/abc?forget=1&key=secret&issue=heat"));
    assert.deepEqual(result, { location: "/submissions/abc?issue=heat", clearSession: false });
  });
});
