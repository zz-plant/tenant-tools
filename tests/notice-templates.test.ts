import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildingIssue } from "../src/data/notice/issues/building";
import { commonIssue } from "../src/data/notice/issues/common";
import { depositIssue } from "../src/data/notice/issues/deposit";
import { entryIssue } from "../src/data/notice/issues/entry";
import { heatIssue } from "../src/data/notice/issues/heat";
import { leakIssue } from "../src/data/notice/issues/leak";
import { lockoutIssue } from "../src/data/notice/issues/lockout";
import { noTimelineIssue } from "../src/data/notice/issues/noTimeline";
import { pestsIssue } from "../src/data/notice/issues/pests";
import { buildNoticeText, createInitialFormState } from "../src/components/noticeBuilder/logic";
import { lintVerySimpleEnglish } from "../src/lib/copyLint";

// Every issue file, including ones the builder does not list yet (deposit, lockout).
const allIssues = [
  heatIssue,
  leakIssue,
  pestsIssue,
  entryIssue,
  commonIssue,
  noTimelineIssue,
  buildingIssue,
  depositIssue,
  lockoutIssue,
];
const stages = ["A", "B", "C"] as const;
const now = new Date("2026-09-23T15:00:00");

describe("notice template coverage (AGENTS.md Appendix B)", () => {
  it("has Standard English and Very simple English text for every stage of every issue", () => {
    for (const issue of allIssues) {
      for (const stage of stages) {
        assert.ok(issue.notices[stage]?.en?.trim(), `${issue.id} is missing Standard English ${stage}`);
        assert.ok(issue.simple[stage]?.trim(), `${issue.id} is missing Very simple English ${stage}`);
      }
    }
  });

  it("has a Spanish and Polish final reminder wherever the first notice is translated", () => {
    for (const issue of allIssues) {
      for (const language of ["es", "pl"]) {
        if (issue.notices.A?.[language]) {
          assert.ok(issue.notices.C?.[language]?.trim(), `${issue.id} is missing the ${language} final reminder`);
        }
      }
    }
  });

  it("keeps every Standard English text clear of idioms, pressure, and legal claims", () => {
    for (const issue of allIssues) {
      for (const stage of stages) {
        const result = lintVerySimpleEnglish(issue.notices[stage]?.en ?? "");
        assert.deepEqual(result.warnings, [], `${issue.id} Standard English ${stage}`);
      }
    }
  });
});

describe("Standard English final reminders", () => {
  it("are used for stage C and name the first message date and the next normal step", () => {
    const state = {
      ...createInitialFormState(now),
      simpleEnglish: false,
      building: "2400 W Wabansia",
      firstMessageDate: "2026-09-10",
    };
    for (const issue of [noTimelineIssue, buildingIssue, lockoutIssue]) {
      const first = buildNoticeText({ ...state, stage: "A" }, issue, now);
      const finalReminder = buildNoticeText({ ...state, stage: "C" }, issue, now);
      assert.notEqual(finalReminder, first, `${issue.id} final reminder falls back to the first notice`);
      assert.ok(finalReminder.includes("2026-09-10"), `${issue.id} final reminder is missing the first message date`);
      assert.ok(finalReminder.includes("the next normal step is"), `${issue.id} final reminder is missing the next step`);
    }
  });

  it("are used in Spanish and Polish, with the first message date filled in", () => {
    const greetings = { es: "Hola,", pl: "Dzień dobry," } as const;
    for (const [language, greeting] of Object.entries(greetings)) {
      const state = {
        ...createInitialFormState(now),
        language,
        stage: "C",
        building: "2400 W Wabansia",
        firstMessageDate: "2026-09-10",
      };
      for (const issue of [noTimelineIssue, buildingIssue, lockoutIssue]) {
        const text = buildNoticeText(state, issue, now);
        assert.ok(text.startsWith(greeting), `${issue.id} ${language} final reminder is not in ${language}`);
        assert.ok(text.includes("2026-09-10"), `${issue.id} ${language} final reminder is missing the first message date`);
        assert.ok(!text.includes("[DATE OF FIRST MESSAGE]"), `${issue.id} ${language} left the placeholder`);
      }
    }
  });
});
