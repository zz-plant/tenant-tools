export const sanitizeLimitedText = (value: string, limit: number) => value.trim().slice(0, limit);

export type SensitiveContentFlag = "email" | "phone" | "unit";

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
