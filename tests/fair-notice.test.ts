import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkFairNotice } from "../src/lib/fairNotice";
import { getFairNoticeRule } from "../src/data/rules";

const rule = getFairNoticeRule("2026-10-07");
const tiers = rule?.tiers ?? [];

describe("getFairNoticeRule", () => {
  it("has the 30, 60, and 120 day periods with sources", () => {
    assert.ok(rule);
    assert.equal(rule.section, "RLTO 5-12-130(j)");
    assert.deepEqual(tiers.map((tier) => tier.days), [30, 60, 120]);
    assert.ok(rule.sources.some((source) => source.url.includes("fair-notice-ordinance")));
  });
});

describe("checkFairNotice", () => {
  it("is on time when the notice gives at least the required days", () => {
    const check = checkFairNotice({ tiers, tierId: "6_months_to_3_years", noticeDate: "2026-10-02", changeDate: "2026-12-01" });
    assert.deepEqual(check, { requiredDays: 60, daysGiven: 60, onTime: true, latestOnTimeDate: "2026-10-02" });
  });

  it("is late when the notice gives fewer days, and says the last on-time date", () => {
    const check = checkFairNotice({ tiers, tierId: "over_3_years", noticeDate: "2026-10-01", changeDate: "2027-01-01" });
    assert.ok(check);
    assert.equal(check.requiredDays, 120);
    assert.equal(check.daysGiven, 92);
    assert.equal(check.onTime, false);
    assert.equal(check.latestOnTimeDate, "2026-09-03");
  });

  it("returns null for missing inputs", () => {
    assert.equal(checkFairNotice({ tiers, tierId: "", noticeDate: "2026-10-01", changeDate: "2026-11-01" }), null);
    assert.equal(checkFairNotice({ tiers, tierId: "under_6_months", noticeDate: "", changeDate: "2026-11-01" }), null);
    assert.equal(checkFairNotice({ tiers, tierId: "under_6_months", noticeDate: "2026-10-01", changeDate: "bad" }), null);
  });
});
