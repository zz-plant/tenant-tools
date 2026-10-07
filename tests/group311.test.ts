import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildGroup311Items, buildGroup311Message, fill311Script } from "../src/lib/group311";
import type { SubmissionRecord } from "../src/lib/submissions";

const record = (overrides: Partial<SubmissionRecord>): SubmissionRecord => ({
  id: "r1",
  building: "2400 W Wabansia",
  issue: "leak",
  issueLabel: "Water leak / ceiling leak / water damage",
  stage: "A",
  language: "en",
  portfolio: "other",
  startDate: "2026-10-01",
  reportDate: "2026-10-01",
  reportCount: 1,
  simpleEnglish: true,
  zone: "",
  issueDetails: {},
  createdAt: "2026-10-01T00:00:00.000Z",
  status: "open",
  ...overrides,
});

describe("group 311 day", () => {
  it("fills scripts with the record's facts and keeps missing ones visible", () => {
    assert.equal(
      fill311Script("There is ongoing water leaking at [LOCATION] since [START DATE].", record({ issueDetails: { location: "kitchen ceiling" } })),
      "There is ongoing water leaking at kitchen ceiling since Oct 1, 2026."
    );
    assert.equal(fill311Script("At [LOCATION].", record({})), "At [LOCATION].");
  });

  it("lists open problems with a 311 category and counts logged requests", () => {
    const items = buildGroup311Items(
      [
        record({ id: "a", ticketNumber: "SR1" }),
        record({ id: "b", issue: "no-timeline" }),
        record({ id: "c", status: "resolved" }),
        record({ id: "d", issue: "heat", issueLabel: "Heat not working / not warm enough" }),
      ],
      new Map([
        ["a", [
          { id: "1", type: "request_311_filed", date: "2026-10-05" },
          { id: "2", type: "request_311_filed", date: "2026-10-05" },
        ]],
      ])
    );
    assert.deepEqual(items.map((item) => item.recordId), ["a", "d"]);
    assert.equal(items[0].requestsLogged, "3");
    assert.equal(items[1].requestsLogged, "0");
    assert.equal(items[1].category, "No heat");
  });

  it("makes a group chat message with no address or key", () => {
    const items = buildGroup311Items([record({ id: "a" })], new Map());
    const message = buildGroup311Message(items, "2026-10-07");
    assert.ok(message.startsWith("Group 311 day: Oct 7, 2026."));
    assert.ok(message.includes("- Water leak / ceiling leak / water damage (311 category: Water leak)"));
    assert.ok(!message.includes("Wabansia"));
    assert.ok(!/key=/.test(message));
  });
});
