import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildFollowUpItems, buildMeetingReport, summarizeWins } from "../src/lib/followUp";
import type { RecordEvent } from "../src/lib/recordEvents";
import type { SubmissionRecord } from "../src/lib/submissions";
import { lintVerySimpleEnglish } from "../src/lib/copyLint";

const today = "2026-10-20";

const record = (overrides: Partial<SubmissionRecord>): SubmissionRecord => ({
  id: "r1",
  building: "2400 W Wabansia",
  issue: "leak",
  issueLabel: "Water leak / ceiling leak / water damage",
  stage: "A",
  language: "en",
  portfolio: "other",
  startDate: "2026-10-18",
  reportDate: "2026-10-18",
  reportCount: 1,
  simpleEnglish: true,
  zone: "",
  issueDetails: {},
  createdAt: "2026-10-18T00:00:00.000Z",
  status: "open",
  ...overrides,
});

const event = (id: string, type: RecordEvent["type"], date: string, ref?: string): RecordEvent => ({ id, type, date, ...(ref ? { ref } : {}) });

describe("buildFollowUpItems", () => {
  it("flags a reply that is overdue, and clears it when a reply is logged", () => {
    const records = [record({ id: "a" })];
    const due = new Map([["a", [event("1", "reply_due", "2026-10-19")]]]);
    const items = buildFollowUpItems(records, due, today);
    assert.deepEqual(items.map((item) => item.kind), ["reply_overdue"]);
    assert.equal(items[0].message, "Reply was due Oct 19, 2026. No reply is logged.");

    const replied = new Map([["a", [event("1", "reply_due", "2026-10-19"), event("2", "management_replied", "2026-10-19")]]]);
    assert.deepEqual(buildFollowUpItems(records, replied, today), []);
  });

  it("counts only a reply after the earlier due date for a new reply date", () => {
    const records = [record({ id: "a", startDate: "2026-09-01", reportDate: "2026-09-01" })];
    const oldReplyOnly = new Map([
      [
        "a",
        [
          event("1", "reply_due", "2026-09-15"),
          event("2", "management_replied", "2026-09-10"),
          event("3", "reply_due", "2026-10-19"),
        ],
      ],
    ]);
    const replyItems = (events: Map<string, RecordEvent[]>) =>
      buildFollowUpItems(records, events, today)
        .filter((item) => item.kind === "reply_overdue")
        .map((item) => item.date);
    assert.deepEqual(replyItems(oldReplyOnly), ["2026-10-19"]);

    const newReply = new Map([
      ["a", [...(oldReplyOnly.get("a") ?? []), event("4", "management_replied", "2026-10-02")]],
    ]);
    assert.deepEqual(replyItems(newReply), []);
  });

  it("flags a missed promised repair date unless a fix is logged", () => {
    const records = [record({ id: "a" })];
    const promised = new Map([["a", [event("1", "repair_date_promised", "2026-10-19")]]]);
    assert.equal(buildFollowUpItems(records, promised, today)[0].kind, "promise_missed");
    const fixed = new Map([["a", [event("1", "repair_date_promised", "2026-10-19"), event("2", "repair_completed", "2026-10-20")]]]);
    assert.deepEqual(buildFollowUpItems(records, fixed, today), []);
  });

  it("notes when the RLTO repair period has passed", () => {
    const items = buildFollowUpItems([record({ id: "a", reportDate: "2026-10-01", startDate: "2026-10-19" })], new Map(), today);
    const passed = items.find((item) => item.kind === "rlto_period_passed");
    assert.ok(passed);
    assert.equal(passed.date, "2026-10-15");
  });

  it("says when an issue qualifies for a 311 inspection with no 311 request logged", () => {
    const old = record({ id: "a", startDate: "2026-10-10", reportDate: "2026-10-19" });
    assert.ok(buildFollowUpItems([old], new Map(), today).some((item) => item.kind === "qualifies_311"));
    const withTicket = record({ id: "a", startDate: "2026-10-10", reportDate: "2026-10-19", ticketNumber: "SR26-1" });
    assert.ok(!buildFollowUpItems([withTicket], new Map(), today).some((item) => item.kind === "qualifies_311"));
    const filed = new Map([["a", [event("1", "request_311_filed", "2026-10-15", "SR26-2")]]]);
    assert.ok(!buildFollowUpItems([old], filed, today).some((item) => item.kind === "qualifies_311"));
    const entry = record({ id: "b", issue: "no-timeline", startDate: "2026-10-01", reportDate: "2026-10-19" });
    assert.ok(!buildFollowUpItems([entry], new Map(), today).some((item) => item.kind === "qualifies_311"));
  });

  it("skips resolved and merged records and uses calm wording", () => {
    const records = [
      record({ id: "a", status: "resolved", startDate: "2026-09-01" }),
      record({ id: "b", mergedInto: "a", startDate: "2026-09-01" }),
    ];
    assert.deepEqual(buildFollowUpItems(records, new Map(), today), []);
    const items = buildFollowUpItems([record({ id: "c", startDate: "2026-09-01", reportDate: "2026-09-01" })], new Map(), today);
    for (const item of items) {
      assert.deepEqual(lintVerySimpleEnglish(item.message).warnings, [], item.message);
      assert.ok(!/escalat|force|punish/i.test(item.message));
    }
  });
});

describe("summarizeWins", () => {
  it("counts each fixed record once, by its latest win", () => {
    const records = [record({ id: "a" }), record({ id: "b" }), record({ id: "c" })];
    const events = new Map([
      ["a", [event("1", "repair_completed", "2026-09-01"), event("2", "fixed_after_letter", "2026-10-01")]],
      ["b", [event("3", "fixed_after_311", "2026-10-05")]],
      ["c", [event("4", "entry_offered", "2026-10-05")]],
    ]);
    assert.deepEqual(summarizeWins(records, events), { total: 2, afterLetter: 1, after311: 1 });
    assert.deepEqual(summarizeWins(records, events, "2026-10-02"), { total: 1, afterLetter: 0, after311: 1 });
  });
});

describe("buildMeetingReport", () => {
  it("collects overview, replies, deadlines, problems, and wins", () => {
    const records = [
      record({ id: "a", startDate: "2026-09-01", reportDate: "2026-09-02", reportCount: 5 }),
      record({ id: "b", issue: "heat", issueLabel: "Heat not working / not warm enough", startDate: "2026-10-15", reportDate: "2026-10-15" }),
      record({ id: "c", status: "resolved", startDate: "2026-08-01" }),
    ];
    const events = new Map([
      ["a", [event("1", "reply_due", "2026-10-25"), event("2", "portal_marked_complete", "2026-10-02", "WO-1")]],
      ["b", [event("3", "reply_due", "2026-10-18"), event("4", "management_replied", "2026-10-17")]],
      ["c", [event("5", "fixed_after_letter", "2026-10-10")]],
    ]);
    const report = buildMeetingReport({ building: "2400 W Wabansia", records, eventsByRecord: events, today });
    assert.equal(report.overview.open, "2");
    assert.equal(report.overview.winsLast90Days, 1);
    assert.deepEqual(report.replies, { requested: 2, received: 1, missing: 1 });
    assert.deepEqual(report.upcoming.map((entry) => entry.date), ["2026-10-25"]);
    assert.equal(report.topProblems[0].id, "a");
    assert.equal(report.topProblems[0].reports, "5");
    assert.equal(report.topProblems[0].lastFact, "Oct 25, 2026: Reply requested by");
    assert.equal(report.wins[0].label, "Fixed after the joint letter");
  });
});
