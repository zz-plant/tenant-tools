import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildAccessQuery,
  buildBuildingDashboardUrl,
  buildLinkSuffix,
  buildSubmissionDetailsUrl,
} from "../src/lib/navigation";

describe("navigation helpers", () => {
  it("does not build query strings for access keys", () => {
    const query = buildAccessQuery();
    assert.equal(query, "");
    assert.equal(buildLinkSuffix(query), "");
  });

  it("builds dashboard URLs without propagated access keys", () => {
    assert.equal(
      buildBuildingDashboardUrl({
        buildingId: "2400 W Wabansia",
        accessKey: "resident-key",
        stewardKey: "steward-key",
      }),
      "/buildings/2400%20W%20Wabansia"
    );
  });

  it("builds submission URLs without propagated access keys", () => {
    assert.equal(
      buildSubmissionDetailsUrl({
        submissionId: "submission-123",
        accessKey: "resident-key",
        stewardKey: "steward-key",
      }),
      "/submissions/submission-123"
    );
  });
});
