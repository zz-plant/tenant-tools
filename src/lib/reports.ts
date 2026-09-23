export type ReportEntry = {
  id: string;
  submissionId: string;
  createdAt: string;
};

export const REPORT_ENTRY_TTL_SECONDS = 60 * 60 * 24 * 90;

export const createReportEntry = (submissionId: string): ReportEntry => ({
  id: crypto.randomUUID(),
  submissionId,
  createdAt: new Date().toISOString(),
});

/**
 * One-way marker for "this browser session already added me too to this record".
 * The submission id is part of the hash, so the same session cannot be linked across records.
 */
export const hashReporterSession = async (submissionId: string, sessionId: string) => {
  const bytes = new TextEncoder().encode(`${submissionId}:${sessionId}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};
