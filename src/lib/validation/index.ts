export const sanitizeLimitedText = (value: string, limit: number) => value.trim().slice(0, limit);

export type SensitiveContentFlag = "email" | "phone" | "unit";
export type SoftContentWarningFlag = "name_hint" | "accusation";

const sensitivePatterns: Record<SensitiveContentFlag, RegExp> = {
  email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  phone: /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-])\d{3}[\s.-]\d{4}\b/,
  unit: /(?:\b(?:apt|apartment|unit|suite|ste)\b|#)\s*[A-Z0-9-]+/i,
};

const sensitiveMessages: Record<SensitiveContentFlag, string> = {
  email: "Remove email addresses.",
  phone: "Remove phone numbers.",
  unit: "Remove unit numbers.",
};

const softWarningPatterns: Record<SoftContentWarningFlag, RegExp> = {
  name_hint: /\b(?:mr|mrs|ms|dr)\.?\s+[A-Z][a-z]+\b|\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/,
  accusation: /\b(?:illegal|fraud|scam)\b/i,
};

const softWarningMessages: Record<SoftContentWarningFlag, string> = {
  name_hint: "Do not include names of individuals.",
  accusation: "Avoid accusation terms. Write only observable facts.",
};

export const detectSensitiveContent = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return [] as SensitiveContentFlag[];
  }
  const flags = (Object.entries(sensitivePatterns) as Array<[SensitiveContentFlag, RegExp]>)
    .filter(([, pattern]) => pattern.test(trimmed))
    .map(([flag]) => flag);
  return Array.from(new Set(flags));
};

export const getSensitiveContentMessages = (value: string) =>
  detectSensitiveContent(value).map((flag) => sensitiveMessages[flag]);

export const detectSoftContentWarnings = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return [] as SoftContentWarningFlag[];
  }
  const flags = (Object.entries(softWarningPatterns) as Array<[SoftContentWarningFlag, RegExp]>)
    .filter(([, pattern]) => pattern.test(trimmed))
    .map(([flag]) => flag);
  return Array.from(new Set(flags));
};

export const getSoftContentWarningMessages = (value: string) =>
  detectSoftContentWarnings(value).map((flag) => softWarningMessages[flag]);

export const isValidDateString = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const [, yearRaw, monthRaw, dayRaw] = match;
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }

  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(parsed.valueOf())) {
    return false;
  }

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() + 1 === month &&
    parsed.getUTCDate() === day
  );
};
