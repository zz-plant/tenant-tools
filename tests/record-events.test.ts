import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  afterRequestEventTypes,
  formatRecordEventLabel,
  parseRecordEvent,
  recordEventDefinitions,
  recordEventTypes,
  sortRecordEvents,
  summarizeFollowUpFacts,
  validateRecordEventInput,
  type RecordEvent,
} from "../src/lib/recordEvents";
import { getSubmissionTimelineEntries } from "../src/lib/submissionTimeline";
import { lintVerySimpleEnglish } from "../src/lib/copyLint";

const today = "2026-10-07";

describe("validateRecordEventInput", () => {
  it("accepts a known type with a past date", () => {
    const result = validateRecordEventInput({ type: "entry_offered", date: "2026-10-01" }, today);
    assert.deepEqual(result, { ok: true, data: { type: "entry_offered", date: "2026-10-01" } });
  });

  it("rejects unknown types and bad dates", () => {
    assert.equal(validateRecordEventInput({ type: "comment", date: "2026-10-01" }, today).ok, false);
    assert.equal(validateRecordEventInput({ type: "entry_offered", date: "10/01/2026" }, today).ok, false);
    assert.equal(validateRecordEventInput({ type: "entry_offered", date: "1999-12-31" }, today).ok, false);
    assert.equal(validateRecordEventInput(null, today).ok, false);
  });

  it("allows future dates only for deadlines and promised dates", () => {
    assert.equal(validateRecordEventInput({ type: "reply_due", date: "2026-10-21" }, today).ok, true);
    assert.equal(validateRecordEventInput({ type: "repair_date_promised", date: "2026-11-01" }, today).ok, true);
    assert.equal(validateRecordEventInput({ type: "management_replied", date: "2026-10-21" }, today).ok, false);
    // One day ahead is allowed for residents whose local date is ahead of the server.
    assert.equal(validateRecordEventInput({ type: "management_replied", date: "2026-10-08" }, today).ok, true);
    assert.equal(validateRecordEventInput({ type: "reply_due", date: "2028-01-01" }, today).ok, false);
  });

  it("keeps a short reference only for types that take one, and rejects phone numbers", () => {
    const portal = validateRecordEventInput({ type: "portal_marked_complete", date: "2026-10-01", ref: " WO-12345 " }, today);
    assert.deepEqual(portal, { ok: true, data: { type: "portal_marked_complete", date: "2026-10-01", ref: "WO-12345" } });

    const ignored = validateRecordEventInput({ type: "entry_offered", date: "2026-10-01", ref: "something" }, today);
    assert.deepEqual(ignored, { ok: true, data: { type: "entry_offered", date: "2026-10-01" } });

    const tenDigit = validateRecordEventInput({ type: "inspection_done", date: "2026-10-01", ref: "2610012345" }, today);
    assert.equal(tenDigit.ok, true);

    const phone = validateRecordEventInput({ type: "inspection_done", date: "2026-10-01", ref: "773-555-0100" }, today);
    assert.equal(phone.ok, false);

    const long = validateRecordEventInput({ type: "portal_marked_complete", date: "2026-10-01", ref: "x".repeat(80) }, today);
    assert.ok(long.ok && long.data.ref?.length === 40);
  });
});

describe("record event helpers", () => {
  it("reads stored facts defensively", () => {
    assert.deepEqual(parseRecordEvent("abc", { type: "entry_offered", date: "2026-10-01" }), {
      id: "abc",
      type: "entry_offered",
      date: "2026-10-01",
    });
    assert.equal(parseRecordEvent("abc", { type: "nope", date: "2026-10-01" }), null);
    assert.equal(parseRecordEvent("abc", { type: "entry_offered", date: "bad" }), null);
    assert.equal(parseRecordEvent("abc", "text"), null);
  });

  it("formats labels with the reference number", () => {
    assert.equal(
      formatRecordEventLabel({ type: "portal_marked_complete", ref: "12345" }),
      "Portal request marked complete, but not fixed (work order 12345)"
    );
    assert.equal(formatRecordEventLabel({ type: "entry_offered" }), "Resident offered entry for repair or treatment");
  });

  it("uses literal, calm labels", () => {
    for (const type of recordEventTypes) {
      const { label, dateLabel, refLabel } = recordEventDefinitions[type];
      for (const text of [label, dateLabel, refLabel ?? ""]) {
        assert.deepEqual(lintVerySimpleEnglish(text).warnings, [], text);
        assert.ok(!/retaliat|illegal|fraud/i.test(text), `${type} label accuses: ${text}`);
      }
    }
  });

  it("groups changes after a request separately", () => {
    assert.deepEqual(afterRequestEventTypes, [
      "rent_increase_notice",
      "nonrenewal_notice",
      "service_reduced",
      "eviction_notice",
    ]);
  });

  it("summarizes follow-up facts without changes after a request", () => {
    const events: RecordEvent[] = [
      { id: "1", type: "portal_marked_complete", date: "2026-09-10" },
      { id: "2", type: "portal_marked_complete", date: "2026-09-20" },
      { id: "3", type: "entry_offered", date: "2026-09-12" },
      { id: "4", type: "rent_increase_notice", date: "2026-10-01" },
    ];
    assert.equal(summarizeFollowUpFacts(events), "Marked complete, not fixed: 2; Entry offered: 1");
    assert.equal(summarizeFollowUpFacts([]), "");
  });

  it("sorts by date", () => {
    const sorted = sortRecordEvents([
      { id: "b", type: "entry_offered", date: "2026-10-02" },
      { id: "a", type: "entry_offered", date: "2026-10-01" },
    ]);
    assert.deepEqual(sorted.map((event) => event.id), ["a", "b"]);
  });
});

describe("timeline with dated facts", () => {
  it("adds each fact as a dated entry", () => {
    const entries = getSubmissionTimelineEntries({
      stage: "A",
      issue: "leak",
      startDate: "2026-09-28",
      reportDate: "2026-10-01",
      events: [
        { id: "1", type: "reply_due", date: "2026-10-10" },
        { id: "2", type: "portal_marked_complete", date: "2026-10-05", ref: "WO-9" },
      ],
    });
    assert.deepEqual(
      entries.map((entry) => `${entry.date} ${entry.label}`),
      [
        "2026-09-28 Issue started",
        "2026-10-01 Notice sent",
        "2026-10-05 Portal request marked complete, but not fixed (work order WO-9)",
        "2026-10-10 Reply requested by",
        "2026-10-15 14 days after first written notice (RLTO 5-12-110)",
      ]
    );
  });
});
