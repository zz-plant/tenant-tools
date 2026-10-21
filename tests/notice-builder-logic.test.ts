import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { issueOptions } from "../src/data/noticeData";
import {
  buildGuidanceScript,
  buildNextSteps,
  buildNoticeText,
  collectIssueDetails,
  collectRuleCards,
  computeDaysOpen,
  createInitialFormState,
  getIssueGuidance,
  withLeaseQuote,
} from "../src/components/noticeBuilder/logic";
import { lintVerySimpleEnglish } from "../src/lib/copyLint";

const now = new Date("2026-09-23T15:00:00");
const leak = issueOptions.find((option) => option.id === "leak");
const building = issueOptions.find((option) => option.id === "building");

describe("createInitialFormState", () => {
  it("fills today and start date", () => {
    const state = createInitialFormState(now);
    assert.equal(state.today, "2026-09-23");
    assert.equal(state.startDate, "2026-09-23");
    assert.equal(state.simpleEnglish, true);
  });
});

describe("buildNoticeText", () => {
  it("returns empty text without an issue", () => {
    assert.equal(buildNoticeText(createInitialFormState(now), undefined, now), "");
  });

  it("fills placeholders and keeps missing ones visible", () => {
    const state = { ...createInitialFormState(now), simpleEnglish: false, building: "2400 W Wabansia", startDate: "2026-09-01" };
    const text = buildNoticeText(state, building, now);
    assert.ok(text.includes("2400 W Wabansia"));
    assert.ok(text.includes("[ISSUE]"));
    assert.ok(!text.includes("[ADDRESS]"));
  });

  it("uses the very simple English template when selected", () => {
    const state = { ...createInitialFormState(now), building: "2400 W Wabansia", issueDescription: "door fobs not working" };
    assert.ok(building);
    assert.equal(buildNoticeText(state, building, now).includes("door fobs not working"), true);
    assert.ok(buildNoticeText(state, building, now).startsWith("We are residents"));
  });

  it("uses the very simple English follow-up and final reminder for stages B and C", () => {
    const heat = issueOptions.find((option) => option.id === "heat");
    assert.ok(heat);
    const base = {
      ...createInitialFormState(now),
      building: "2400 W Wabansia",
      startDate: "2026-09-01",
      firstMessageDate: "2026-09-10",
    };
    const first = buildNoticeText({ ...base, stage: "A" }, heat, now);
    const followUp = buildNoticeText({ ...base, stage: "B" }, heat, now);
    const finalReminder = buildNoticeText({ ...base, stage: "C" }, heat, now);

    assert.notEqual(followUp, first);
    assert.notEqual(finalReminder, followUp);
    assert.ok(followUp.includes("First message: 2026-09-10."));
    assert.ok(finalReminder.includes("First message: 2026-09-10."));
    assert.ok(finalReminder.includes("the next normal step is to call 311"));
    assert.ok(!first.includes("next normal step"));
  });

  it("gives every issue a simple follow-up with the first message date and a calm final reminder", () => {
    const state = { ...createInitialFormState(now), building: "2400 W Wabansia", firstMessageDate: "2026-09-10" };
    for (const issue of issueOptions) {
      const followUp = buildNoticeText({ ...state, stage: "B" }, issue, now);
      const finalReminder = buildNoticeText({ ...state, stage: "C" }, issue, now);
      assert.ok(followUp.includes("2026-09-10"), `${issue.id} follow-up is missing the first message date`);
      assert.ok(finalReminder.includes("2026-09-10"), `${issue.id} final reminder is missing the first message date`);
      assert.ok(finalReminder.includes("the next normal step is"), `${issue.id} final reminder is missing the next step`);
      assert.ok(!finalReminder.includes("[DATE OF FIRST MESSAGE]"), `${issue.id} left the placeholder`);
    }
  });

  it("uses the English notice, in the chosen English style, for Spanish and Polish until reviewed", () => {
    const heat = issueOptions.find((option) => option.id === "heat");
    for (const simpleEnglish of [true, false]) {
      const english = buildNoticeText({ ...createInitialFormState(now), building: "2400 W Wabansia", simpleEnglish }, heat, now);
      for (const language of ["es", "pl"]) {
        const state = { ...createInitialFormState(now), building: "2400 W Wabansia", language, simpleEnglish };
        assert.equal(buildNoticeText(state, heat, now), english, `${language} simple=${simpleEnglish}`);
      }
    }
  });

  it("falls back to English when a language has no template", () => {
    const state = { ...createInitialFormState(now), simpleEnglish: false, language: "xx" };
    assert.ok(leak);
    assert.ok(buildNoticeText(state, leak, now).length > 0);
  });
});

describe("computeDaysOpen and buildNextSteps", () => {
  it("never returns negative days open", () => {
    assert.equal(computeDaysOpen("2026-09-01", "2026-09-23", now), 22);
    assert.equal(computeDaysOpen("2026-09-30", "2026-09-23", now), 0);
    assert.equal(computeDaysOpen("", "2026-09-23", now), 0);
  });

  it("unlocks steps by days open, one at a time in the UI", () => {
    const early = buildNextSteps({ startDate: "2026-09-22", today: "2026-09-23", building: "", now });
    assert.deepEqual(early.map((step) => step.unlocked), [true, false, false]);
    assert.equal(early[1].remaining, 2);

    const later = buildNextSteps({ startDate: "2026-09-01", today: "2026-09-23", building: "B", issueLabel: "Heat", now });
    assert.deepEqual(later.map((step) => step.unlocked), [true, true, true]);
    assert.ok(later[0].calendarLink.startsWith("https://calendar.google.com/"));
  });

  it("opens each step on the right local day, not the day before", () => {
    const steps = buildNextSteps({ startDate: "2026-10-21", today: "2026-10-21", building: "", now });
    assert.deepEqual(steps.map((step) => step.reminderDate), ["2026-10-21", "2026-10-24", "2026-10-27"]);
    assert.ok(steps[1].calendarLink.includes("dates=20261024/20261024"));
  });

  it("has no calendar link without a start date", () => {
    const steps = buildNextSteps({ startDate: "", today: "2026-09-23", building: "", now });
    assert.ok(steps.every((step) => step.calendarLink === ""));
    assert.equal(steps[0].reminderDate, "");
  });
});

describe("collectIssueDetails", () => {
  it("keeps only filled fields for the issue, in order", () => {
    const state = { ...createInitialFormState(now), location: " kitchen ceiling ", attachment: "", temp: "60" };
    assert.deepEqual(collectIssueDetails(state, ["location", "attachment"]), [
      { key: "location", label: "Location (for leaks)", value: "kitchen ceiling" },
    ]);
  });
});

describe("guidance and sources", () => {
  it("fills the 311 script", () => {
    const guidance = getIssueGuidance("leak");
    assert.ok(guidance);
    const state = { ...createInitialFormState(now), location: "hallway ceiling", startDate: "2026-09-01" };
    assert.ok(buildGuidanceScript(guidance.script, state).includes("hallway ceiling"));
    assert.equal(getIssueGuidance("building"), null);
  });

  it("lists each source once per rule card", () => {
    for (const card of collectRuleCards("heat", "2026-10-07")) {
      const urls = card.sources.map((source) => source.url);
      assert.equal(new Set(urls).size, urls.length, card.title);
    }
  });

  it("returns rule cards for the issue on the builder date", () => {
    const cards = collectRuleCards("lockout", "2026-10-07");
    assert.ok(cards.some((card) => card.title === "Lockouts are not allowed"));
    assert.ok(cards.some((card) => card.title === "Eviction enforcement"));
    assert.equal(cards.at(-1)?.title, "RLTO summary (Chicago)");
  });
});

describe("lease quote", () => {
  const base = { leaseSection: "Section 7", leaseQuote: '  "Landlord shall deliver possession   of the Premises."  ', leaseChecked: true };

  it("adds the section and the exact words before the end of the notice", () => {
    const text = withLeaseQuote("I live at 1 Main St.\nPlease reply.\n\n", base);
    assert.equal(text, 'I live at 1 Main St.\nPlease reply.\nMy lease, section 7, says: "Landlord shall deliver possession of the Premises."\n\n');
  });

  it("leaves the notice alone until both parts are filled and checked", () => {
    assert.equal(withLeaseQuote("A\n\n", { ...base, leaseChecked: false }), "A\n\n");
    assert.equal(withLeaseQuote("A\n\n", { ...base, leaseSection: " " }), "A\n\n");
    assert.equal(withLeaseQuote("A\n\n", { ...base, leaseQuote: "" }), "A\n\n");
  });

  it("is plain enough for Very simple English", () => {
    const line = withLeaseQuote("", { ...base, leaseQuote: "Rent is due on the first day of the month." }).trim();
    assert.deepEqual(lintVerySimpleEnglish(line).warnings, []);
  });
});
