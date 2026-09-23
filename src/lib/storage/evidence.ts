import type { EvidenceImageType } from "../evidence/imageMetadata";

export type EvidenceEnv = {
  EVIDENCE_BUCKET?: R2Bucket;
  EVIDENCE_SIGNING_KEY?: string;
};

export type EvidenceRecord = {
  id: string;
  submissionId: string;
  /** Random R2 key. It never contains the building, address, or submission id. */
  objectKey: string;
  contentType: EvidenceImageType;
  size: number;
  createdAt: string;
};

/*
 * KV:  evidence:{submissionId}:{evidenceId}  EvidenceRecord (JSON)
 * R2:  ev/{random uuid}                       Stripped image bytes. The bucket is never public.
 */

const evidencePrefix = (submissionId: string) => `evidence:${submissionId}:`;
const evidenceKey = (submissionId: string, evidenceId: string) => `${evidencePrefix(submissionId)}${evidenceId}`;

export const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024;
export const MAX_EVIDENCE_PER_RECORD = 10;

export const getEvidenceConfig = (env: EvidenceEnv) => {
  const bucket = env.EVIDENCE_BUCKET ?? null;
  const signingKey = typeof env.EVIDENCE_SIGNING_KEY === "string" ? env.EVIDENCE_SIGNING_KEY.trim() : "";
  return bucket && signingKey ? { bucket, signingKey } : null;
};

export const newEvidenceObjectKey = () => `ev/${crypto.randomUUID()}`;

export const saveEvidenceRecord = async (kv: KVNamespace, record: EvidenceRecord) =>
  kv.put(evidenceKey(record.submissionId, record.id), JSON.stringify(record));

export const fetchEvidenceRecord = async (kv: KVNamespace, submissionId: string, evidenceId: string) => {
  const value = await kv.get<EvidenceRecord>(evidenceKey(submissionId, evidenceId), { type: "json" });
  return value && typeof value.objectKey === "string" ? value : null;
};

export const deleteEvidenceRecord = async (kv: KVNamespace, submissionId: string, evidenceId: string) =>
  kv.delete(evidenceKey(submissionId, evidenceId));

export const listEvidenceRecords = async (kv: KVNamespace, submissionId: string) => {
  const records: EvidenceRecord[] = [];
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix: evidencePrefix(submissionId), cursor, limit: 100 });
    cursor = page.list_complete ? undefined : page.cursor;
    for (const key of page.keys) {
      const record = await kv.get<EvidenceRecord>(key.name, { type: "json" });
      if (record && typeof record.objectKey === "string") {
        records.push(record);
      }
    }
  } while (cursor);
  return records.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
};
