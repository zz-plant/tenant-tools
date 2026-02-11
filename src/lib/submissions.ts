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
import { getSensitiveContentMessages, isValidDateString, sanitizeLimitedText } from "./validation";

const issueIds = new Set(issueOptions.map((issue) => issue.id));
const allowedDetailKeys = new Set(Object.keys(fieldDefinitions));

export const detailCharacterLimit = 200;
const maxBuildingLength = 120;
export const ticketNumberCharacterLimit = 40;
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

export const isSubmissionRecord = (value: unknown): value is SubmissionRecord => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SubmissionRecord>;
  return typeof candidate.id === "string" && candidate.id.length > 0;
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

const asString = (value: unknown) => (typeof value === "string" ? value : "");

const asNumber = (value: unknown) => (typeof value === "number" ? value : Number(value));

const validateRequiredDate = (label: string, value: string, errors: string[]) => {
  if (!isValidDateString(value)) {
    errors.push(`${label} is invalid.`);
  }
};

const validateOptionalDate = (label: string, value: string, errors: string[]) => {
  if (value && !isValidDateString(value)) {
    errors.push(`${label} is invalid.`);
  }
};

export const validateSubmissionInput = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["Payload must be an object."] } as const;
  }

  const data = payload as Record<string, unknown>;
  const errors: string[] = [];

  const building = sanitizeLimitedText(asString(data.building), maxBuildingLength);
  if (!building) {
    errors.push("Building is required.");
  } else {
    pushSensitiveErrors("Building", building, errors);
  }

  const issue = asString(data.issue);
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

  const startDate = asString(data.startDate);
  validateRequiredDate("Start date", startDate, errors);

  const reportDate = asString(data.reportDate);
  validateRequiredDate("Report date", reportDate, errors);

  const reportCount = asNumber(data.reportCount);
  if (!Number.isInteger(reportCount) || reportCount < 1 || reportCount > 50) {
    errors.push("Report count is invalid.");
  }

  const zone = asString(data.zone);
  if (zone && !isValidZoneId(zone)) {
    errors.push("Zone is invalid.");
  }

  const firstMessageDate = asString(data.firstMessageDate);
  validateOptionalDate("First message date", firstMessageDate, errors);

  const ticketDate = asString(data.ticketDate);
  validateOptionalDate("311 ticket date", ticketDate, errors);

  const ticketNumber = sanitizeLimitedText(asString(data.ticketNumber), ticketNumberCharacterLimit);
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
