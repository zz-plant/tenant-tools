import { fieldDefinitions, issue311Guidance } from "../../data/noticeData";
import type { IssueOption } from "../../data/notice/types";
import { getRuleCardsForIssue } from "../../data/rules";
import { addDays, formatCalendarDate, formatDate, getCurrentTime } from "../../lib/dateUtils";
import { fillTemplate, noticeUnlockDays } from "../../lib/noticeUtils";
import { noticeBuilderStrings } from "../../data/i18n/strings";
import { createTranslator, resolveNoticeTemplate } from "../../lib/i18n/translate";

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

export const createInitialFormState = (now: Date = new Date(), initialBuilding: string = ""): FormState => {
  const formatted = formatDate(now);
  return {
    ...initialFormState,
    building: initialBuilding,
    today: formatted,
    startDate: formatted,
    time: getCurrentTime(now),
  };
};

export type NoticeTemplateChoice = {
  template: string;
  /** Language of `template`: the chosen language, or "en" when the English notice is shown. */
  language: string;
  simpleEnglish: boolean;
  /** The resident chose another language, but it has no reviewed translation of this notice. */
  withheld: boolean;
};

/**
 * Template for the chosen issue, stage, and language. Another language is used only with a
 * reviewed translation (AGENTS.md §14, lib/i18n/translate.ts). Otherwise the English notice is
 * used, in Very simple English when that option is on.
 */
export const chooseNoticeTemplate = (state: FormState, issue: IssueOption): NoticeTemplateChoice => {
  const translated = resolveNoticeTemplate(issue.id, state.stage, state.language, issue.notices[state.stage]?.en);
  if (translated) {
    return { template: translated, language: state.language, simpleEnglish: false, withheld: false };
  }
  const withheld = state.language !== "en";
  if (state.simpleEnglish) {
    const template = issue.simple[state.stage as keyof IssueOption["simple"]] || issue.simple.A;
    return { template, language: "en", simpleEnglish: true, withheld };
  }
  return { template: issue.notices[state.stage]?.en || issue.notices.A.en, language: "en", simpleEnglish: false, withheld };
};

/** Note shown when `withheld` is true. In the chosen language only when the note itself is reviewed. */
export const getWithheldNoticeNote = (language: string) => {
  const translator = createTranslator(language);
  const key = "builder.notice_not_reviewed";
  const text = translator.t(key, noticeBuilderStrings[key]);
  return { text, lang: translator.stats().shown > 0 ? language : "en" };
};

export const buildNoticeText = (state: FormState, issue: IssueOption | undefined, now: Date = new Date()) => {
  if (!issue) {
    return "";
  }

  const { template } = chooseNoticeTemplate(state, issue);

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
    label: "Send the first notice",
    unlockDay: 0,
    calendarLabel: "Send first notice",
    detail:
      "Send a short written notice to the owner or manager address the landlord gave you. Keep a copy. Write down the date you sent it.",
  },
  {
    label: "Send a follow-up",
    unlockDay: noticeUnlockDays.followUp,
    calendarLabel: "Send follow-up notice",
    detail: "If there is no repair date yet, send a follow-up. Include the date of your first message.",
  },
  {
    label: "Send a final reminder",
    unlockDay: noticeUnlockDays.finalReminder,
    calendarLabel: "Send final reminder",
    detail:
      "If there is still no repair date, send a final calm reminder. The next normal step after this is a 311 inspection request.",
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

/** Rule cards for "Help and sources", using the rules in effect on `onDate` (`YYYY-MM-DD`). */
export const collectRuleCards = (issueId: string, onDate?: string) =>
  getRuleCardsForIssue(issueId || undefined, onDate || undefined);
