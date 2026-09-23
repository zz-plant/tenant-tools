import type { ReportEntry } from "../reports";

const reportKey = (submissionId: string, reportId: string) => `report:${submissionId}:${reportId}`;

export const saveReportEntry = async (
  kv: KVNamespace,
  entry: ReportEntry,
  options: { expirationTtl?: number } = {}
) => kv.put(reportKey(entry.submissionId, entry.id), JSON.stringify(entry), options);
