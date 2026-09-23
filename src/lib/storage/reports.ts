import type { ReportEntry } from "../reports";

const reportKey = (submissionId: string, reportId: string) => `report:${submissionId}:${reportId}`;

export const saveReportEntry = async (
  kv: KVNamespace,
  entry: ReportEntry,
  options: { expirationTtl?: number } = {}
) => kv.put(reportKey(entry.submissionId, entry.id), JSON.stringify(entry), options);

const reporterKey = (submissionId: string, reporterHash: string) => `metoo:${submissionId}:${reporterHash}`;

export const hasReporterMarker = async (kv: KVNamespace, submissionId: string, reporterHash: string) =>
  (await kv.get(reporterKey(submissionId, reporterHash))) !== null;

export const saveReporterMarker = async (
  kv: KVNamespace,
  submissionId: string,
  reporterHash: string,
  options: { expirationTtl?: number } = {}
) => kv.put(reporterKey(submissionId, reporterHash), "1", options);
