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
import {
  getSensitiveContentMessages,
  getSoftContentWarningMessages,
  isValidDateString,
  sanitizeLimitedText,
} from "./validation";

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
  /** Count saved by the resident who created the record. "Me too" markers are added on top. */
  baseReportCount?: number;
  /** Reports carried over from duplicate records a steward merged into this one. */
  mergedReportCount?: number;
  /** Set on a duplicate after a steward merges it into another record. */
  mergedInto?: string;
  /** Number of private evidence files on this record. Files are never listed publicly. */
  evidenceCount?: number;
};

export const isSubmissionRecord = (value: unknown): value is SubmissionRecord => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SubmissionRecord>;
  return typeof candidate.id === "string" && candidate.id.length > 0;
};

const readString = (value: unknown) => (typeof value === "string" ? value : "");

const readOptionalString = (value: unknown) => (typeof value === "string" && value ? value : undefined);

const readCount = (value: unknown) => {
  const count = typeof value === "number" ? value : Number(value);
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
};

const readOptionalCount = (value: unknown) => (value === undefined ? undefined : readCount(value));

/**
 * The one place that turns stored KV JSON into a `SubmissionRecord`.
 * Stored records can be older than the current type, so every field is read defensively.
 */
export const parseSubmissionRecord = (value: unknown): SubmissionRecord | null => {
  if (!isSubmissionRecord(value)) {
    return null;
  }
  const raw = value as unknown as Record<string, unknown>;
  const issue = readString(raw.issue);
  const details = raw.issueDetails && typeof raw.issueDetails === "object" ? raw.issueDetails : {};
  const issueDetails = Object.fromEntries(
    Object.entries(details as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string"
    )
  );
  const zone = readString(raw.zone);

  return {
    id: readString(raw.id),
    createdAt: readString(raw.createdAt),
    building: readString(raw.building),
    issue,
    issueLabel: readString(raw.issueLabel) || issueOptions.find((option) => option.id === issue)?.label || issue,
    status: normalizeSubmissionStatus(raw.status),
    stage: readEnumValue(raw.stage, allowedStageSet) ?? "A",
    language: readEnumValue(raw.language, supportedLanguageSet) ?? "en",
    portfolio: readEnumValue(raw.portfolio, allowedPortfolioSet) ?? "other",
    startDate: readString(raw.startDate),
    reportDate: readString(raw.reportDate),
    reportCount: readCount(raw.reportCount),
    simpleEnglish: Boolean(raw.simpleEnglish),
    zone: isValidZoneId(zone) ? zone : "",
    firstMessageDate: readOptionalString(raw.firstMessageDate),
    ticketDate: readOptionalString(raw.ticketDate),
    ticketNumber: readOptionalString(raw.ticketNumber),
    issueDetails,
    baseReportCount: readOptionalCount(raw.baseReportCount),
    mergedReportCount: readOptionalCount(raw.mergedReportCount),
    mergedInto: readOptionalString(raw.mergedInto),
    evidenceCount: readOptionalCount(raw.evidenceCount),
  };
};

export const isValidSubmissionStatus = (value: unknown): value is SubmissionStatus =>
  typeof value === "string" && allowedStatusSet.has(value as SubmissionStatus);

export const normalizeSubmissionStatus = (value: unknown): SubmissionStatus =>
  isValidSubmissionStatus(value) ? value : "open";

const readEnumValue = <T extends string>(value: unknown, allowed: Set<T>) => {
  if (typeof value !== "string") {
    return null;
  }
  return allowed.has(value as T) ? (value as T) : null;
};

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

const pushSensitiveErrors = (
  label: string,
  value: string,
  errors: string[],
  options: { allowBareDigitRuns?: boolean } = {}
) => {
  getSensitiveContentMessages(value, options).forEach((message) => {
    errors.push(`${label}: ${message}`);
  });
};

const pushSoftWarnings = (label: string, value: string, warnings: string[]) => {
  getSoftContentWarningMessages(value).forEach((message) => {
    warnings.push(`${label}: ${message}`);
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
    return { ok: false, errors: ["Payload must be an object."] as string[] } as const;
  }

  const data = payload as Record<string, unknown>;
  const errors: string[] = [];
  const warnings: string[] = [];

  const building = sanitizeLimitedText(asString(data.building), maxBuildingLength);
  if (!building) {
    errors.push("Building is required.");
  } else {
    pushSensitiveErrors("Building", building, errors);
    pushSoftWarnings("Building", building, warnings);
  }

  const issue = readEnumValue(data.issue, issueIds);
  if (!issue) {
    errors.push("Issue type is invalid.");
  }

  const stage = readEnumValue(data.stage, allowedStageSet);
  if (!stage) {
    errors.push("Stage is invalid.");
  }

  const language = readEnumValue(data.language, supportedLanguageSet);
  if (!language) {
    errors.push("Language is invalid.");
  }

  const portfolio = readEnumValue(data.portfolio, allowedPortfolioSet);
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
    // 311 ticket numbers can be 10 digits, so only formatted phone numbers are rejected here.
    pushSensitiveErrors("Ticket number", ticketNumber, errors, { allowBareDigitRuns: true });
    pushSoftWarnings("Ticket number", ticketNumber, warnings);
  }

  const simpleEnglish = Boolean(data.simpleEnglish);
  const issueDetails =
    data.issueDetails && typeof data.issueDetails === "object"
      ? sanitizeDetails(data.issueDetails as Record<string, unknown>)
      : {};

  if (Object.keys(issueDetails).length > 0) {
    const detailMessages = new Set<string>();
    const detailWarnings = new Set<string>();
    Object.values(issueDetails).forEach((value) => {
      getSensitiveContentMessages(value).forEach((message) => detailMessages.add(message));
      getSoftContentWarningMessages(value).forEach((message) => detailWarnings.add(message));
    });
    detailMessages.forEach((message) => errors.push(`Details: ${message}`));
    detailWarnings.forEach((message) => warnings.push(`Details: ${message}`));
  }

  if (errors.length > 0 || !issue || !stage || !language || !portfolio) {
    return { ok: false, errors } as const;
  }

  return {
    ok: true,
    warnings,
    data: {
      building,
      issue,
      stage,
      language,
      portfolio,
      startDate,
      reportDate,
      reportCount,
      simpleEnglish,
      zone: zone as ZoneId | "",
      firstMessageDate: firstMessageDate || undefined,
      ticketDate: ticketDate || undefined,
      ticketNumber: ticketNumber || undefined,
      issueDetails,
    } satisfies SubmissionInput,
  } as const;
};
