import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateWaitlistInput, waitlistBuildingLimit } from "../src/lib/waitlist";

describe("waitlist validation", () => {
  it("rejects unit hints in building addresses", () => {
    const result = validateWaitlistInput({ building: "2400 W Wabansia Apt 2B", portfolio: "continuum" });
    assert.equal(result.ok, false);
    assert.ok(result.errors.includes("Do not include unit numbers in the building address."));
  });

  it("trims building input to the configured limit", () => {
    const result = validateWaitlistInput({
      building: `  ${"A".repeat(waitlistBuildingLimit + 5)}  `,
      portfolio: "continuum",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.building.length, waitlistBuildingLimit);
    }
  });
});
