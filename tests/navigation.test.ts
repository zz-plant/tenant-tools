import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildAccessQuery,
  buildBuildingDashboardUrl,
  buildLinkSuffix,
  buildSubmissionDetailsUrl,
} from "../src/lib/navigation";

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

  it("builds dashboard URLs with propagated access keys", () => {
    assert.equal(
      buildBuildingDashboardUrl({
        buildingId: "2400 W Wabansia",
        accessKey: "resident-key",
        stewardKey: "steward-key",
      }),
      "/buildings/2400%20W%20Wabansia?key=resident-key&stewardKey=steward-key"
    );

    assert.equal(
      buildBuildingDashboardUrl({
        buildingId: "2400 W Wabansia",
        accessKey: null,
      }),
      "/buildings/2400%20W%20Wabansia"
    );
  });

  it("builds submission URLs with propagated access keys", () => {
    assert.equal(
      buildSubmissionDetailsUrl({
        submissionId: "submission-123",
        accessKey: "resident-key",
        stewardKey: "steward-key",
      }),
      "/submissions/submission-123?key=resident-key&stewardKey=steward-key"
    );

    assert.equal(
      buildSubmissionDetailsUrl({
        submissionId: "submission-123",
        accessKey: "resident-key",
      }),
      "/submissions/submission-123?key=resident-key"
    );
  });
});
