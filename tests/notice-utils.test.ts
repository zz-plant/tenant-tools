import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getVisibleUnlockableSteps } from "../src/lib/noticeUtils";

describe("getVisibleUnlockableSteps", () => {
  it("returns unlocked steps plus the next locked step", () => {
    const steps = [
      { id: "a", unlocked: true },
      { id: "b", unlocked: true },
      { id: "c", unlocked: false },
      { id: "d", unlocked: false },
    ];

    assert.deepEqual(getVisibleUnlockableSteps(steps).map((step) => step.id), ["a", "b", "c"]);
  });

  it("returns all steps when every step is unlocked", () => {
    const steps = [
      { id: "a", unlocked: true },
      { id: "b", unlocked: true },
    ];

    assert.deepEqual(getVisibleUnlockableSteps(steps).map((step) => step.id), ["a", "b"]);
  });

  it("returns only the first step when all steps are locked", () => {
    const steps = [
      { id: "a", unlocked: false },
      { id: "b", unlocked: false },
    ];

    assert.deepEqual(getVisibleUnlockableSteps(steps).map((step) => step.id), ["a"]);
  });
});
