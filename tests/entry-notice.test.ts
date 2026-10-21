import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkEntryNotice } from "../src/lib/entryNotice";

describe("checkEntryNotice", () => {
  it("counts hours when both times are known", () => {
    const onTime = checkEntryNotice({ noticeDate: "2026-10-01", noticeTime: "09:00", entryDate: "2026-10-03", entryTime: "10:00" });
    assert.equal(onTime?.result, "on_time");
    assert.equal(onTime?.hoursGiven, 49);

    const late = checkEntryNotice({ noticeDate: "2026-10-01", noticeTime: "18:00", entryDate: "2026-10-03", entryTime: "10:00" });
    assert.equal(late?.result, "late");
    assert.equal(late?.hoursGiven, 40);
    assert.deepEqual(late?.latestOnTime, { date: "2026-10-01", time: "10:00" });
  });

  it("uses whole days when a time is missing, and says when that is not enough", () => {
    assert.equal(checkEntryNotice({ noticeDate: "2026-10-01", entryDate: "2026-10-04" })?.result, "on_time");
    assert.equal(checkEntryNotice({ noticeDate: "2026-10-01", entryDate: "2026-10-02" })?.result, "late");
    assert.equal(checkEntryNotice({ noticeDate: "2026-10-01", entryDate: "2026-10-03" })?.result, "unclear");
    assert.equal(checkEntryNotice({ noticeDate: "2026-10-01", entryDate: "2026-10-01", entryTime: "15:00" })?.result, "late");
  });

  it("flags entry before 8 AM or after 8 PM", () => {
    const early = checkEntryNotice({ noticeDate: "2026-10-01", entryDate: "2026-10-05", entryTime: "07:30" });
    assert.equal(early?.outsideReasonableHours, true);
    const evening = checkEntryNotice({ noticeDate: "2026-10-01", entryDate: "2026-10-05", entryTime: "20:00" });
    assert.equal(evening?.outsideReasonableHours, false);
    assert.equal(checkEntryNotice({ noticeDate: "2026-10-01", entryDate: "2026-10-05", entryTime: "20:30" })?.outsideReasonableHours, true);
  });

  it("returns nothing for missing dates or an entry before the notice", () => {
    assert.equal(checkEntryNotice({ noticeDate: "", entryDate: "2026-10-05" }), null);
    assert.equal(checkEntryNotice({ noticeDate: "2026-10-05", entryDate: "2026-10-01" }), null);
    assert.equal(checkEntryNotice({ noticeDate: "2026-10-01", noticeTime: "12:00", entryDate: "2026-10-01", entryTime: "09:00" }), null);
  });
});
