import { parseSubmissionRecord, type SubmissionRecord } from "../submissions";

export type SubmissionStorageEnv = {
  SUBMISSIONS_KV?: KVNamespace;
};

/*
 * KV layout
 *
 * submission:{id}                 Full record (JSON). List metadata holds a summary.
 * bidx:{buildingHash}:{id}        Per-building index. Empty value. List metadata holds a summary.
 * bidx-ready:{buildingHash}       Set after older records for the building are copied into the index.
 * metoo:{id}:{reporterHash}       One "me too" per browser session per record.
 *
 * `buildingHash` is a one-way hash, so keys never show a street address.
 */

const submissionKey = (id: string) => `submission:${id}`;
const indexPrefix = (buildingHash: string) => `bidx:${buildingHash}:`;
const indexKey = (buildingHash: string, id: string) => `${indexPrefix(buildingHash)}${id}`;
const indexReadyKey = (buildingHash: string) => `bidx-ready:${buildingHash}`;

const sha256Hex = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const hashBuildingId = async (buildingId: string) => (await sha256Hex(`building:${buildingId}`)).slice(0, 32);

/**
 * Small summary stored as KV list metadata (limit: 1024 bytes).
 * Listing reads it without one `kv.get` per record.
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
  mergedInto?: string;
};

export const toSubmissionListMetadata = (record: SubmissionRecord): SubmissionListMetadata => ({
  v: 1,
  building: record.building,
  issue: record.issue,
  startDate: record.startDate,
  reportDate: record.reportDate,
  reportCount: record.reportCount,
  createdAt: record.createdAt,
  status: record.status,
  ...(record.mergedInto ? { mergedInto: record.mergedInto } : {}),
});

export const isSubmissionListMetadata = (value: unknown): value is SubmissionListMetadata =>
  Boolean(value) && typeof value === "object" && (value as { v?: unknown }).v === 1;

export const getSubmissionsKv = (env: SubmissionStorageEnv) => env.SUBMISSIONS_KV ?? null;

export const fetchSubmissionRecord = async (kv: KVNamespace, id: string) =>
  parseSubmissionRecord(await kv.get(submissionKey(id), { type: "json" }));

export const saveSubmissionRecord = async (kv: KVNamespace, record: SubmissionRecord) => {
  const metadata = toSubmissionListMetadata(record);
  await kv.put(submissionKey(record.id), JSON.stringify(record), { metadata });
  if (record.building) {
    await kv.put(indexKey(await hashBuildingId(record.building), record.id), "", { metadata });
  }
};

export const listSubmissionKeys = async (kv: KVNamespace, cursor?: string, limit = 50) =>
  kv.list({ prefix: "submission:", cursor, limit });

export const isBuildingIndexReady = async (kv: KVNamespace, buildingHash: string) =>
  (await kv.get(indexReadyKey(buildingHash))) !== null;

export const markBuildingIndexReady = async (kv: KVNamespace, buildingHash: string) =>
  kv.put(indexReadyKey(buildingHash), new Date().toISOString());

export const listBuildingIndex = async (kv: KVNamespace, buildingHash: string, cursor?: string, limit = 100) =>
  kv.list({ prefix: indexPrefix(buildingHash), cursor, limit });

export const writeBuildingIndexEntry = async (kv: KVNamespace, buildingHash: string, record: SubmissionRecord) =>
  kv.put(indexKey(buildingHash, record.id), "", { metadata: toSubmissionListMetadata(record) });

// "Me too" markers ---------------------------------------------------------

const reporterPrefix = (submissionId: string) => `metoo:${submissionId}:`;
const reporterKey = (submissionId: string, reporterHash: string) => `${reporterPrefix(submissionId)}${reporterHash}`;

export const hasReporterMarker = async (kv: KVNamespace, submissionId: string, reporterHash: string) =>
  (await kv.get(reporterKey(submissionId, reporterHash))) !== null;

/** Markers have no TTL: together with the base count they are the source of truth for the count. */
export const saveReporterMarker = async (kv: KVNamespace, submissionId: string, reporterHash: string) =>
  kv.put(reporterKey(submissionId, reporterHash), "1");

export const countReporterMarkers = async (kv: KVNamespace, submissionId: string) => {
  let total = 0;
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix: reporterPrefix(submissionId), cursor, limit: 1000 });
    total += page.keys.length;
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return total;
};
