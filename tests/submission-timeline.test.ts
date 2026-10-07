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
    assert.equal(stageC[1]?.label, "Final reminder sent");
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

  it("adds the RLTO date counted from the first written notice", () => {
    const stageA = getSubmissionTimelineEntries({
      stage: "A",
      issue: "leak",
      startDate: "2026-09-28",
      reportDate: "2026-10-01",
    });
    assert.deepEqual(stageA.at(-1), {
      label: "14 days after first written notice (RLTO 5-12-110)",
      date: "2026-10-15",
    });

    const stageB = getSubmissionTimelineEntries({
      stage: "B",
      issue: "heat",
      reportDate: "2026-10-05",
      firstMessageDate: "2026-10-01",
    });
    assert.ok(stageB.some((entry) => entry.date === "2026-10-02" && entry.label.startsWith("24 hours")));
  });

  it("adds no RLTO date when no timing rule applies or the first notice date is missing", () => {
    const entry = getSubmissionTimelineEntries({ stage: "A", issue: "entry", reportDate: "2026-10-01" });
    const noFirstNotice = getSubmissionTimelineEntries({ stage: "B", issue: "leak", reportDate: "2026-10-05" });
    assert.deepEqual(entry.map((item) => item.label), ["Notice sent"]);
    assert.deepEqual(noFirstNotice.map((item) => item.label), ["Follow-up sent"]);
  });
});
