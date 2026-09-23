export const sanitizeLimitedText = (value: string, limit: number) => value.trim().slice(0, limit);

export type SensitiveContentFlag = "email" | "phone" | "unit";
export type SoftContentWarningFlag = "name_hint" | "accusation";

const sensitivePatterns: Record<SensitiveContentFlag, RegExp> = {
  email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  // Covers "(773)555-0100", "(773) 555-0100", "773-555-0100", "773.555.0100", and "+1 773 555 0100".
  phone: /(?:\+?1[\s.-]?)?(?:\(\d{3}\)\s?|\b\d{3}[\s.-])\d{3}[\s.-]\d{4}\b/,
  unit: /(?:\b(?:apt|apartment|unit|suite|ste)\b|#)\s*[A-Z0-9-]+/i,
};

// A bare 10-digit run such as "7735550100". Checked separately because 311 ticket numbers
// can also be 10 digits.
const bareDigitPhonePattern = /(?:^|[^\d])(?:\+?1)?[2-9]\d{2}[2-9]\d{6}(?!\d)/;

type SensitiveContentOptions = {
  allowBareDigitRuns?: boolean;
};

const sensitiveMessages: Record<SensitiveContentFlag, string> = {
  email: "Remove email addresses.",
  phone: "Remove phone numbers.",
  unit: "Remove unit numbers.",
};

const honorificNamePattern = /\b(?:mr|mrs|ms|dr)\.?\s+[A-Z][a-z]+\b/i;
const capitalizedPairPattern = /\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g;

// Capitalized building words are common in short facts ("Front Door", "Water Leak").
// They should not trigger the name warning.
const buildingVocabulary = new Set([
  "access", "back", "basement", "bathroom", "bedroom", "boiler", "building", "ceiling", "common",
  "door", "doors", "elevator", "entry", "fob", "fobs", "front", "garage", "gate", "hall", "hallway",
  "heat", "heater", "intercom", "kitchen", "laundry", "leak", "lights", "lobby", "lock", "locks",
  "mail", "main", "parking", "pest", "pests", "roof", "room", "side", "stairs", "stairwell", "trash",
  "unit", "water", "window", "windows",
]);

const hasLikelyPersonName = (value: string) => {
  if (honorificNamePattern.test(value)) {
    return true;
  }
  for (const match of value.matchAll(capitalizedPairPattern)) {
    const [, first, second] = match;
    if (!buildingVocabulary.has(first.toLowerCase()) && !buildingVocabulary.has(second.toLowerCase())) {
      return true;
    }
  }
  return false;
};

const softWarningChecks: Record<SoftContentWarningFlag, (value: string) => boolean> = {
  name_hint: hasLikelyPersonName,
  accusation: (value) => /\b(?:illegal|fraud|scam)\b/i.test(value),
};

const softWarningMessages: Record<SoftContentWarningFlag, string> = {
  name_hint: "Do not include names of individuals.",
  accusation: "Avoid accusation terms. Write only observable facts.",
};

export const detectSensitiveContent = (value: string, options: SensitiveContentOptions = {}) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return [] as SensitiveContentFlag[];
  }
  const flags = (Object.entries(sensitivePatterns) as Array<[SensitiveContentFlag, RegExp]>)
    .filter(([, pattern]) => pattern.test(trimmed))
    .map(([flag]) => flag);
  if (!options.allowBareDigitRuns && bareDigitPhonePattern.test(trimmed)) {
    flags.push("phone");
  }
  return Array.from(new Set(flags));
};

export const getSensitiveContentMessages = (value: string, options: SensitiveContentOptions = {}) =>
  detectSensitiveContent(value, options).map((flag) => sensitiveMessages[flag]);

export const detectSoftContentWarnings = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return [] as SoftContentWarningFlag[];
  }
  const flags = (Object.entries(softWarningChecks) as Array<[SoftContentWarningFlag, (value: string) => boolean]>)
    .filter(([, check]) => check(trimmed))
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
