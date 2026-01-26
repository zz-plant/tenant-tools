import { fieldDefinitions, issueOptions } from "../data/noticeData";
import {
  allowedPortfolios,
  allowedZones,
  noticeStages,
  submissionStatuses,
  supportedLanguages,
} from "../data/submissionOptions";
import type {
  NoticeStage,
  PortfolioId,
  SubmissionStatus,
  SupportedLanguage,
  ZoneId,
} from "../data/submissionOptions";
import { getSensitiveContentMessages, sanitizeLimitedText } from "./validation";

const issueIds = new Set(issueOptions.map((issue) => issue.id));
const allowedDetailKeys = new Set(Object.keys(fieldDefinitions));

export const detailCharacterLimit = 200;
const maxBuildingLength = 120;
const maxTicketNumberLength = 40;
const supportedLanguageSet = new Set<SupportedLanguage>(supportedLanguages);
const allowedStageSet = new Set<NoticeStage>(noticeStages);
const allowedZoneSet = new Set<ZoneId>(allowedZones);
const allowedPortfolioSet = new Set<PortfolioId>(allowedPortfolios);
const allowedStatusSet = new Set<SubmissionStatus>(submissionStatuses);

export type { SubmissionStatus } from "../data/submissionOptions";

export const submissionStatusLabels: Record<SubmissionStatus, string> = {
  open: "Open",
  resolved: "Verified restored",
  archived: "Archived",
};

export type SubmissionInput = {
  building: string;
  issue: string;
  stage: NoticeStage;
  language: SupportedLanguage;
  portfolio: PortfolioId;
  startDate: string;
  reportDate: string;
  reportCount: number;
  simpleEnglish: boolean;
  zone: ZoneId | "";
  firstMessageDate?: string;
  ticketDate?: string;
  ticketNumber?: string;
  issueDetails: Record<string, string>;
};

export type SubmissionRecord = SubmissionInput & {
  id: string;
  createdAt: string;
  issueLabel: string;
  status: SubmissionStatus;
};

export const isValidSubmissionStatus = (value: unknown): value is SubmissionStatus =>
  typeof value === "string" && allowedStatusSet.has(value);

export const normalizeSubmissionStatus = (value: unknown): SubmissionStatus =>
  isValidSubmissionStatus(value) ? value : "open";

const isValidNoticeStage = (value: unknown): value is NoticeStage =>
  typeof value === "string" && allowedStageSet.has(value as NoticeStage);

const isValidSupportedLanguage = (value: unknown): value is SupportedLanguage =>
  typeof value === "string" && supportedLanguageSet.has(value as SupportedLanguage);

const isValidPortfolioId = (value: unknown): value is PortfolioId =>
  typeof value === "string" && allowedPortfolioSet.has(value as PortfolioId);

const isValidZoneId = (value: unknown): value is ZoneId =>
  typeof value === "string" && allowedZoneSet.has(value as ZoneId);

const isValidDateString = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf());
};

const sanitizeDetails = (details: Record<string, unknown>) => {
  const cleaned: Record<string, string> = {};
  Object.entries(details).forEach(([key, value]) => {
    if (!allowedDetailKeys.has(key) || typeof value !== "string") {
      return;
    }
    const trimmed = sanitizeLimitedText(value, detailCharacterLimit);
    if (trimmed) {
      cleaned[key] = trimmed;
    }
  });
  return cleaned;
};

const pushSensitiveErrors = (label: string, value: string, errors: string[]) => {
  getSensitiveContentMessages(value).forEach((message) => {
    errors.push(`${label}: ${message}`);
  });
};

export const validateSubmissionInput = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["Payload must be an object."] } as const;
  }

  const data = payload as Record<string, unknown>;
  const errors: string[] = [];

  const building =
    typeof data.building === "string" ? sanitizeLimitedText(data.building, maxBuildingLength) : "";
  if (!building) {
    errors.push("Building is required.");
  } else {
    pushSensitiveErrors("Building", building, errors);
  }

  const issue = typeof data.issue === "string" ? data.issue : "";
  if (!issueIds.has(issue)) {
    errors.push("Issue type is invalid.");
  }

  const stage = isValidNoticeStage(data.stage) ? data.stage : "";
  if (!stage) {
    errors.push("Stage is invalid.");
  }

  const language = isValidSupportedLanguage(data.language) ? data.language : "";
  if (!language) {
    errors.push("Language is invalid.");
  }

  const portfolio = isValidPortfolioId(data.portfolio) ? data.portfolio : "";
  if (!portfolio) {
    errors.push("Portfolio is invalid.");
  }

  const startDate = typeof data.startDate === "string" ? data.startDate : "";
  if (!isValidDateString(startDate)) {
    errors.push("Start date is invalid.");
  }

  const reportDate = typeof data.reportDate === "string" ? data.reportDate : "";
  if (!isValidDateString(reportDate)) {
    errors.push("Report date is invalid.");
  }

  const reportCount = typeof data.reportCount === "number" ? data.reportCount : Number(data.reportCount);
  if (!Number.isFinite(reportCount) || reportCount < 1 || reportCount > 50) {
    errors.push("Report count is invalid.");
  }

  const zone = typeof data.zone === "string" ? data.zone : "";
  if (zone && !isValidZoneId(zone)) {
    errors.push("Zone is invalid.");
  }

  const firstMessageDate = typeof data.firstMessageDate === "string" ? data.firstMessageDate : "";
  if (firstMessageDate && !isValidDateString(firstMessageDate)) {
    errors.push("First message date is invalid.");
  }

  const ticketDate = typeof data.ticketDate === "string" ? data.ticketDate : "";
  if (ticketDate && !isValidDateString(ticketDate)) {
    errors.push("311 ticket date is invalid.");
  }

  const ticketNumber =
    typeof data.ticketNumber === "string" ? sanitizeLimitedText(data.ticketNumber, maxTicketNumberLength) : "";
  if (ticketNumber) {
    pushSensitiveErrors("Ticket number", ticketNumber, errors);
  }

  const simpleEnglish = Boolean(data.simpleEnglish);
  const issueDetails =
    data.issueDetails && typeof data.issueDetails === "object"
      ? sanitizeDetails(data.issueDetails as Record<string, unknown>)
      : {};

  if (Object.keys(issueDetails).length > 0) {
    const detailMessages = new Set<string>();
    Object.values(issueDetails).forEach((value) => {
      getSensitiveContentMessages(value).forEach((message) => detailMessages.add(message));
    });
    detailMessages.forEach((message) => errors.push(`Details: ${message}`));
  }

  if (errors.length > 0) {
    return { ok: false, errors } as const;
  }

  return {
    ok: true,
    data: {
      building,
      issue,
      stage: stage as SubmissionInput["stage"],
      language: language as SubmissionInput["language"],
      portfolio: portfolio as SubmissionInput["portfolio"],
      startDate,
      reportDate,
      reportCount,
      simpleEnglish,
      zone,
      firstMessageDate: firstMessageDate || undefined,
      ticketDate: ticketDate || undefined,
      ticketNumber: ticketNumber || undefined,
      issueDetails,
    },
  } as const;
};
