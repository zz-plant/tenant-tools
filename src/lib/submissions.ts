import { fieldDefinitions, issueOptions } from "../data/noticeData";

const issueIds = new Set(issueOptions.map((issue) => issue.id));
const allowedDetailKeys = new Set(Object.keys(fieldDefinitions));

const maxDetailLength = 200;
const maxBuildingLength = 120;
const supportedLanguages = new Set(["en", "es", "hi", "pl"]);
const allowedStages = new Set(["A", "B", "C"]);

export type SubmissionInput = {
  building: string;
  issue: string;
  stage: "A" | "B" | "C";
  language: "en" | "es" | "hi" | "pl";
  startDate: string;
  reportDate: string;
  reportCount: number;
  simpleEnglish: boolean;
  issueDetails: Record<string, string>;
};

export type SubmissionRecord = SubmissionInput & {
  id: string;
  createdAt: string;
  issueLabel: string;
};

const isValidDateString = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf());
};

const sanitizeText = (value: string, limit: number) => value.trim().slice(0, limit);

const sanitizeDetails = (details: Record<string, unknown>) => {
  const cleaned: Record<string, string> = {};
  Object.entries(details).forEach(([key, value]) => {
    if (!allowedDetailKeys.has(key) || typeof value !== "string") {
      return;
    }
    const trimmed = sanitizeText(value, maxDetailLength);
    if (trimmed) {
      cleaned[key] = trimmed;
    }
  });
  return cleaned;
};

export const validateSubmissionInput = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["Payload must be an object."] } as const;
  }

  const data = payload as Record<string, unknown>;
  const errors: string[] = [];

  const building = typeof data.building === "string" ? sanitizeText(data.building, maxBuildingLength) : "";
  if (!building) {
    errors.push("Building is required.");
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

  const simpleEnglish = Boolean(data.simpleEnglish);
  const issueDetails =
    data.issueDetails && typeof data.issueDetails === "object"
      ? sanitizeDetails(data.issueDetails as Record<string, unknown>)
      : {};

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
      startDate,
      reportDate,
      reportCount,
      simpleEnglish,
      issueDetails,
    },
  } as const;
};
