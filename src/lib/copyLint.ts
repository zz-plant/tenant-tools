import { issueOptions } from "../data/notice/issueOptions";

const idiomPatterns = [
  /\bcircle back\b/i,
  /\btouch base\b/i,
  /\bheads up\b/i,
  /\bsqueaky wheel\b/i,
] as const;

const pressurePatterns = [
  /\bforce them\b/i,
  /\bmake them pay\b/i,
  /\bpunish(?: the)? landlord\b/i,
  /\bname and shame\b/i,
] as const;

const legalIntimidationPatterns = [
  /\bthis guarantees\b/i,
  /\byou are entitled to\b/i,
] as const;

export type CopyLintResult = {
  ok: boolean;
  warnings: string[];
};

export const lintVerySimpleEnglish = (text: string): CopyLintResult => {
  const warnings: string[] = [];
  if (!text.trim()) {
    return { ok: true, warnings };
  }

  if (idiomPatterns.some((pattern) => pattern.test(text))) {
    warnings.push("Avoid idioms. Use literal words.");
  }

  if (pressurePatterns.some((pattern) => pattern.test(text))) {
    warnings.push("Avoid pressuring language.");
  }

  if (legalIntimidationPatterns.some((pattern) => pattern.test(text))) {
    warnings.push("Avoid legal claims without citations.");
  }

  return {
    ok: warnings.length === 0,
    warnings,
  };
};

export const lintSimpleNoticeTemplates = () =>
  issueOptions.map((issue) => ({
    issueId: issue.id,
    ...lintVerySimpleEnglish(issue.simple.en),
  }));
