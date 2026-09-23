import { fieldDefinitions, issue311Guidance } from "../../data/noticeData";
import type { IssueOption } from "../../data/notice/types";
import { getRuleCardsForIssue } from "../../data/rules";
import { addDays, formatCalendarDate, formatDate, getCurrentTime } from "../../lib/dateUtils";
import { fillTemplate } from "../../lib/noticeUtils";

/*
 * Pure logic for the notice builder. No React here, so every function can be unit tested.
 */

export const initialFormState = {
  building: "",
  zone: "",
  issue: "",
  stage: "A",
  exportStatus: "open",
  language: "en",
  portfolio: "continuum",
  simpleEnglish: true,
  autoDates: true,
  startDate: "",
  firstMessageDate: "",
  today: "",
  time: "",
  temp: "",
  eventDate: "",
  eventDates: "",
  eventDateTime: "",
  moveOutDate: "",
  pestType: "",
  commonArea: "",
  lockoutAction: "",
  location: "",
  issueDescription: "",
  attachment: "",
  ticketDate: "",
  ticketNumber: "",
};

export type FormState = typeof initialFormState;
export type IssueFieldKey = keyof typeof fieldDefinitions;

export const createInitialFormState = (now: Date = new Date()): FormState => {
  const formatted = formatDate(now);
  return { ...initialFormState, today: formatted, startDate: formatted, time: getCurrentTime(now) };
};

export const buildNoticeText = (state: FormState, issue: IssueOption | undefined, now: Date = new Date()) => {
  if (!issue) {
    return "";
  }

  const template = state.simpleEnglish
    ? issue.simple.en
    : issue.notices[state.stage]?.[state.language] || issue.notices[state.stage]?.en || issue.notices.A.en;

  const values: Record<string, string> = {
    ADDRESS: state.building || "[ADDRESS]",
    ISSUE: state.issueDescription || "[ISSUE]",
    LOCATION: state.location || "[LOCATION]",
    "START DATE": state.startDate || "[START DATE]",
    TODAY: state.today || "[TODAY]",
    TIME: state.time || "[TIME]",
    TEMP: state.temp || "[TEMP]",
    "DATE OF FIRST MESSAGE": state.firstMessageDate || "[DATE OF FIRST MESSAGE]",
    "MOVE-OUT DATE": state.moveOutDate || "[MOVE-OUT DATE]",
    DATE: state.eventDate || "[DATE]",
    DATES: state.eventDates || "[DATES]",
    "DATE/TIME": state.eventDateTime || "[DATE/TIME]",
    "PHOTO/VIDEO": state.attachment || "[PHOTO/VIDEO]",
    "ROACHES/RATS/BEDBUGS": state.pestType || "[ROACHES/RATS/BEDBUGS]",
    "ELEVATOR / GARAGE DOOR / HALL LIGHTS / TRASH ROOM":
      state.commonArea || "[ELEVATOR / GARAGE DOOR / HALL LIGHTS / TRASH ROOM]",
    "LOCK ME OUT / SHUT OFF UTILITIES": state.lockoutAction || "[LOCK ME OUT / SHUT OFF UTILITIES]",
  };

  if (state.autoDates) {
    const today = state.today || formatDate(now);
    values["START DATE"] = state.startDate || today;
    values.TODAY = today;
  }

  return fillTemplate(template, values);
};

const dayMs = 1000 * 60 * 60 * 24;

/** Days from start to today. Negative when the start date is in the future. */
const rawDaysOpen = (startDate: string, today: string, now: Date) => {
  if (!startDate) {
    return 0;
  }
  const start = new Date(startDate);
  const end = today ? new Date(today) : new Date(formatDate(now));
  return Math.floor((end.getTime() - start.getTime()) / dayMs);
};

export const computeDaysOpen = (startDate: string, today: string, now: Date = new Date()) =>
  Math.max(0, rawDaysOpen(startDate, today, now));

export type NextStep = {
  label: string;
  unlockDay: number;
  calendarLabel: string;
  detail: string;
  unlocked: boolean;
  remaining: number;
  calendarLink: string;
  reminderDateLabel: string;
};

const nextStepDefinitions = [
  {
    label: "Common path: first written notice window",
    unlockDay: 0,
    calendarLabel: "Initial notice window",
    detail:
      "Common paths tenants encounter start with a written record. A risk is missing dates, copies, or who received it.",
  },
  {
    label: "Common path: follow-up window after a few days",
    unlockDay: 3,
    calendarLabel: "Follow-up notice window",
    detail:
      "Common paths tenants encounter include a follow-up. A risk is a documentation gap when dates or prior messages are not linked.",
  },
  {
    label: "Common path: final reminder window",
    unlockDay: 6,
    calendarLabel: "Final reminder window",
    detail:
      "Common paths tenants encounter include a last reminder. A risk is unclear timelines when records are incomplete.",
  },
];

/** Escalation cues unlock by days open (AGENTS.md §6.1). */
export const buildNextSteps = ({
  startDate,
  today,
  building,
  issueLabel,
  now = new Date(),
}: {
  startDate: string;
  today: string;
  building: string;
  issueLabel?: string;
  now?: Date;
}): NextStep[] => {
  const start = startDate ? new Date(startDate) : null;
  const daysOpen = rawDaysOpen(startDate, today, now);
  const label = issueLabel || "maintenance issue";
  const buildingLabel = building || "your building";

  return nextStepDefinitions.map((step) => {
    const reminderDate = start ? addDays(start, step.unlockDay) : null;
    const calendarDate = reminderDate ? formatCalendarDate(reminderDate) : "";
    const calendarLink = reminderDate
      ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
          `${step.calendarLabel}: ${label}`
        )}&details=${encodeURIComponent(`${step.detail}\nBuilding: ${buildingLabel}\nIssue: ${label}`)}&dates=${calendarDate}/${calendarDate}`
      : "";

    return {
      ...step,
      unlocked: daysOpen >= step.unlockDay,
      remaining: step.unlockDay - daysOpen,
      calendarLink,
      reminderDateLabel: reminderDate ? formatDate(reminderDate) : "Add a start date",
    };
  });
};

export type IssueDetail = { key: string; label: string; value: string };

/** Filled-in detail fields for the chosen issue, in field order. */
export const collectIssueDetails = (state: FormState, fields: readonly IssueFieldKey[]): IssueDetail[] =>
  fields
    .map((fieldKey): IssueDetail | null => {
      const field = fieldDefinitions[fieldKey];
      const value = String(state[fieldKey as keyof FormState] ?? "").trim();
      return field && value ? { key: fieldKey, label: field.label, value } : null;
    })
    .filter((detail): detail is IssueDetail => Boolean(detail));

export const getIssueGuidance = (issueId: string) =>
  issueId in issue311Guidance ? issue311Guidance[issueId as keyof typeof issue311Guidance] : null;

export const buildGuidanceScript = (script: string, state: FormState) =>
  script
    .replace("[START DATE]", state.startDate || "[START DATE]")
    .replace("[LOCATION]", state.location || "[LOCATION]")
    .replace("[DATE]", state.eventDate || "[DATE]");

/** Unique source links from the rule cards for an issue. */
export const collectRuleSources = (issueId: string) => {
  const sourceMap = new Map<string, string>();
  getRuleCardsForIssue(issueId).forEach((card) => {
    card.sources.forEach((source) => {
      if (!sourceMap.has(source.url)) {
        sourceMap.set(source.url, source.title);
      }
    });
  });
  return Array.from(sourceMap, ([url, title]) => ({ url, title }));
};
