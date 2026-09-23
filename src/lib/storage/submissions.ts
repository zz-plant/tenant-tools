export type SubmissionStorageEnv = {
  SUBMISSIONS_KV?: KVNamespace;
};

const submissionKey = (id: string) => `submission:${id}`;

/**
 * Small summary stored as KV list metadata (limit: 1024 bytes).
 * The dashboard reads it from `kv.list` and skips one `kv.get` per record.
 * Records saved before this field existed have no metadata and are read with `kv.get`.
 * The issue label is left out: labels contain emoji, and the label can be found from the issue id.
 */
export type SubmissionListMetadata = {
  v: 1;
  building: string;
  issue: string;
  startDate: string;
  reportDate: string;
  reportCount: number;
  createdAt: string;
  status: string;
};

type SubmissionSummarySource = {
  id: string;
  building?: string;
  issue?: string;
  issueLabel?: string;
  startDate?: string;
  reportDate?: string;
  reportCount?: number;
  createdAt?: string;
  status?: string;
};

export const toSubmissionListMetadata = (record: SubmissionSummarySource): SubmissionListMetadata => ({
  v: 1,
  building: record.building ?? "",
  issue: record.issue ?? "",
  startDate: record.startDate ?? "",
  reportDate: record.reportDate ?? "",
  reportCount: typeof record.reportCount === "number" ? record.reportCount : 0,
  createdAt: record.createdAt ?? "",
  status: record.status ?? "open",
});

export const isSubmissionListMetadata = (value: unknown): value is SubmissionListMetadata =>
  Boolean(value) && typeof value === "object" && (value as { v?: unknown }).v === 1;

export const getSubmissionsKv = (env: SubmissionStorageEnv) => env.SUBMISSIONS_KV ?? null;

export const fetchSubmissionRecord = async <T = unknown>(kv: KVNamespace, id: string) =>
  kv.get<T>(submissionKey(id), { type: "json" });

export const saveSubmissionRecord = async <T extends SubmissionSummarySource>(kv: KVNamespace, record: T) =>
  kv.put(submissionKey(record.id), JSON.stringify(record), { metadata: toSubmissionListMetadata(record) });

export const listSubmissionKeys = async (kv: KVNamespace, cursor?: string, limit = 50) =>
  kv.list({ prefix: "submission:", cursor, limit });
