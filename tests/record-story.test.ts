import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildRecordLine } from "../src/lib/followUp";
import type { RecordEvent } from "../src/lib/recordEvents";
import { buildRecordStory } from "../src/lib/recordStory";
import { getSubmissionTimelineEntries, getTaggedTimelineEntries } from "../src/lib/submissionTimeline";
import type { SubmissionRecord } from "../src/lib/submissions";

const today = "2026-10-27";

const record = (overrides: Partial<SubmissionRecord>): SubmissionRecord => ({
  id: "r1",
  building: "2400 W Wabansia",
  issue: "leak",
  issueLabel: "Water leak / ceiling leak / water damage",
  stage: "A",
  language: "en",
  portfolio: "other",
  startDate: "2026-09-16",
  reportDate: "2026-09-18",
  reportCount: 1,
  simpleEnglish: true,
  zone: "",
  issueDetails: {},
  createdAt: "2026-09-18T00:00:00.000Z",
  status: "open",
  ...overrides,
});

const event = (id: string, type: RecordEvent["type"], date: string, ref?: string): RecordEvent => ({
  id,
  type,
  date,
  ...(ref ? { ref } : {}),
});

const story = (rec: SubmissionRecord, events: RecordEvent[], day = today) =>
  buildRecordStory(buildRecordLine(rec, events, day), getTaggedTimelineEntries({ ...rec, events }), day);

const summary = (items: ReturnType<typeof buildRecordStory>) =>
  items.map((item) => `${item.kind === "stop" ? item.label : item.date}:${item.state}`);

describe("buildRecordStory", () => {
  const heat = record({ issue: "heat", issueLabel: "No heat or hot water" });
  const events = [
    event("1", "management_replied", "2026-10-02"),
    event("2", "repair_visit_missed", "2026-10-14"),
    event("3", "follow_up_sent", "2026-10-20", "text"),
    event("4", "reply_due", "2026-10-30"),
  ];

  it("puts each fact between the steps, in date order, with steps still to come after today", () => {
    assert.deepEqual(summary(story(heat, events)), [
      "Started:done",
      "Notice:done",
      "2026-09-19:fact",
      "2026-10-02:fact",
      "2026-10-14:fact",
      "Follow-up:done",
      "Final:open",
      "311:open",
      "2026-10-30:fact",
      "Fixed:later",
    ]);
  });

  it("shows the entry a step stands for once, as the step's note", () => {
    const items = story(heat, events);
    const followUp = items.find((item) => item.label === "Follow-up");
    assert.equal(followUp?.note, "Follow-up notice sent (by text)");
    assert.equal(items.filter((item) => item.label.startsWith("Follow-up notice sent")).length, 0);
    assert.equal(items.find((item) => item.label === "Notice")?.note, "Notice sent");
  });

  it("keeps rule dates marked as counted", () => {
    const counted = story(heat, events).filter((item) => item.counted);
    assert.equal(counted.length, 1);
    assert.equal(counted[0].kind, "fact");
  });

  it("draws the line in colour only between reached items", () => {
    const items = story(heat, events);
    const followUpIndex = items.findIndex((item) => item.label === "Follow-up");
    assert.ok(items.slice(0, followUpIndex).every((item) => item.joinsNext));
    assert.equal(items[followUpIndex].joinsNext, false);
    assert.ok(items.slice(followUpIndex + 1).every((item) => !item.joinsNext && !item.reached));
  });

  it("places a locked step at the date it opens", () => {
    const fresh = record({ startDate: "2026-10-25", reportDate: "2026-10-25" });
    const items = story(fresh, [event("1", "reply_due", "2026-10-29")]);
    assert.deepEqual(summary(items).slice(0, 4), ["Started:done", "Notice:done", "Follow-up:locked", "2026-10-29:fact"]);
    assert.equal(items[2].date, "2026-10-28");
  });

  it("keeps a second follow-up as a fact", () => {
    const items = story(heat, [event("1", "follow_up_sent", "2026-10-20"), event("2", "follow_up_sent", "2026-10-24")]);
    assert.equal(items.find((item) => item.label === "Follow-up")?.date, "2026-10-20");
    assert.ok(items.some((item) => item.kind === "fact" && item.date === "2026-10-24"));
  });

  it("puts a resolved record's undated fix after today's facts", () => {
    const resolved = record({ status: "resolved" });
    const items = story(resolved, [event("1", "management_replied", today)]);
    const labels = items.map((item) => item.label);
    assert.ok(labels.indexOf("Fixed") > labels.indexOf("Management replied"));
    assert.equal(items.find((item) => item.label === "Fixed")?.state, "done");
  });
});

describe("getTaggedTimelineEntries", () => {
  it("tags the entries that stand for a step, and the plain list drops the tags", () => {
    const input = {
      stage: "B" as const,
      startDate: "2026-10-01",
      firstMessageDate: "2026-10-02",
      reportDate: "2026-10-06",
      ticketDate: "2026-10-09",
      events: [event("1", "repair_completed", "2026-10-12"), event("2", "management_replied", "2026-10-07")],
    };
    assert.deepEqual(
      getTaggedTimelineEntries(input).map((entry) => entry.stop ?? "-"),
      ["start", "notice", "follow-up", "-", "311", "fixed"]
    );
    assert.ok(getSubmissionTimelineEntries(input).every((entry) => !("stop" in entry)));
  });
});
