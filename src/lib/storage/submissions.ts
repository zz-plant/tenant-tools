export type SubmissionStorageEnv = {
  SUBMISSIONS_KV?: KVNamespace;
};

const submissionKey = (id: string) => `submission:${id}`;

export const getSubmissionsKv = (env: SubmissionStorageEnv) => env.SUBMISSIONS_KV ?? null;

export const fetchSubmissionRecord = async <T = unknown>(kv: KVNamespace, id: string) =>
  kv.get<T>(submissionKey(id), { type: "json" });

export const saveSubmissionRecord = async <T extends { id: string }>(kv: KVNamespace, record: T) =>
  kv.put(submissionKey(record.id), JSON.stringify(record));

export const listSubmissionKeys = async (kv: KVNamespace, cursor?: string, limit = 50) =>
  kv.list({ prefix: "submission:", cursor, limit });
