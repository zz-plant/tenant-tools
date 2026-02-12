import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runAccessAudit, validateNoticeCopy } from "../src/lib/maintenanceTools";

describe("runAccessAudit", () => {
  it("denies without audit context", () => {
    const result = runAccessAudit();
    assert.equal(result.ok, false);
  });

  it("returns aggregate failures only", () => {
    const result = runAccessAudit([
      {
        routeId: "buildings-dashboard",
        requiresResidentKey: true,
        allowsWithoutKey: false,
        evidenceVisible: false,
      },
      {
        routeId: "public-summary",
        requiresResidentKey: true,
        allowsWithoutKey: true,
        evidenceVisible: true,
      },
    ]);

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.summary.totalRoutes, 2);
      assert.equal(result.summary.failingRoutes, 1);
      assert.deepEqual(result.failures, [
        {
          routeId: "public-summary",
          reasons: ["missing_gate", "evidence_exposed"],
        },
      ]);
    }
  });
});

describe("validateNoticeCopy", () => {
  it("returns missing context without template and text", () => {
    const result = validateNoticeCopy();
    assert.equal(result.ok, false);
    assert.deepEqual(result.warningCodes, ["missing_context"]);
  });

  it("returns warning codes for unsafe language", () => {
    const result = validateNoticeCopy(
      "heat-simple",
      "Heads up. We will name and shame."
    );

    assert.equal(result.ok, false);
    assert.deepEqual(result.warningCodes, ["idiom", "pressure"]);
  });
});
