import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildAccessQuery, buildLinkSuffix } from "../src/lib/navigation";

describe("navigation key propagation helpers", () => {
  it("builds query string with resident and steward keys", () => {
    const query = buildAccessQuery({
      accessKey: "resident key",
      stewardKey: "steward-key",
    });
    assert.equal(query, "key=resident%20key&stewardKey=steward-key");
    assert.equal(buildLinkSuffix(query), "?key=resident%20key&stewardKey=steward-key");
  });

  it("omits empty keys", () => {
    const query = buildAccessQuery({ accessKey: null, stewardKey: undefined });
    assert.equal(query, "");
    assert.equal(buildLinkSuffix(query), "");
  });
});
