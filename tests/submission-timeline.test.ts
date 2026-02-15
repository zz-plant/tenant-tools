import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSubmissionTimelineEntries } from "../src/lib/submissionTimeline";

describe("getSubmissionTimelineEntries", () => {
  it("builds stage A timeline without first notice", () => {
    const entries = getSubmissionTimelineEntries({
      stage: "A",
      startDate: "2026-02-01",
      reportDate: "2026-02-03",
      firstMessageDate: "2026-02-02",
      ticketDate: "2026-02-05",
    });

    assert.deepEqual(entries, [
      { label: "Issue started", date: "2026-02-01" },
      { label: "Notice sent", date: "2026-02-03" },
      { label: "311 ticket logged", date: "2026-02-05" },
    ]);
  });

  it("uses stage-specific report labels for B and C", () => {
    const stageB = getSubmissionTimelineEntries({
      stage: "B",
      reportDate: "2026-02-06",
      firstMessageDate: "2026-02-04",
    });
    const stageC = getSubmissionTimelineEntries({
      stage: "C",
      reportDate: "2026-02-06",
      firstMessageDate: "2026-02-04",
    });

    assert.equal(stageB[1]?.label, "Follow-up sent");
    assert.equal(stageC[1]?.label, "Final notice sent");
  });

  it("sorts entries by date", () => {
    const entries = getSubmissionTimelineEntries({
      stage: "B",
      startDate: "2026-02-05",
      reportDate: "2026-02-07",
      firstMessageDate: "2026-02-01",
    });

    assert.deepEqual(entries.map((entry) => entry.date), ["2026-02-01", "2026-02-05", "2026-02-07"]);
  });
});
