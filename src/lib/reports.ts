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
