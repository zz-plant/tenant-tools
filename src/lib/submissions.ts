import { fieldDefinitions, issueOptions } from "../data/noticeData";
import { getSensitiveContentMessages, sanitizeLimitedText } from "./validation";

const issueIds = new Set(issueOptions.map((issue) => issue.id));
const allowedDetailKeys = new Set(Object.keys(fieldDefinitions));

const maxDetailLength = 200;
const maxBuildingLength = 120;
const maxTicketNumberLength = 40;
const supportedLanguages = new Set(["en", "es", "hi", "pl"]);
const allowedStages = new Set(["A", "B", "C"]);
const allowedZones = new Set(["common_area", "hallway", "unit_interior", "entry", "unknown"]);
const allowedPortfolios = new Set(["continuum", "other"]);
const allowedStatuses = new Set(["open", "resolved", "archived"]);

export type SubmissionStatus = "open" | "resolved" | "archived";

export const submissionStatusLabels: Record<SubmissionStatus, string> = {
  open: "Open",
  resolved: "Verified restored",
  archived: "Archived",
};

export type SubmissionInput = {
  building: string;
  issue: string;
  stage: "A" | "B" | "C";
  language: "en" | "es" | "hi" | "pl";
  portfolio: "continuum" | "other";
  startDate: string;
  reportDate: string;
  reportCount: number;
  simpleEnglish: boolean;
  zone: string;
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
  typeof value === "string" && allowedStatuses.has(value);

export const normalizeSubmissionStatus = (value: unknown): SubmissionStatus =>
  isValidSubmissionStatus(value) ? value : "open";

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
    const trimmed = sanitizeLimitedText(value, maxDetailLength);
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

  const stage = typeof data.stage === "string" ? data.stage : "";
  if (!allowedStages.has(stage)) {
    errors.push("Stage is invalid.");
  }

  const language = typeof data.language === "string" ? data.language : "";
  if (!supportedLanguages.has(language)) {
    errors.push("Language is invalid.");
  }

  const portfolio = typeof data.portfolio === "string" ? data.portfolio : "";
  if (!allowedPortfolios.has(portfolio)) {
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
  if (zone && !allowedZones.has(zone)) {
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
