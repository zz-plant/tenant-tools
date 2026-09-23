import { formatPublicReadonlyCount, formatResidentReportCount } from "./reportCount";
import { normalizeSubmissionStatus, parseSubmissionRecord, type SubmissionStatus } from "./submissions";
import {
  hashBuildingId,
  isBuildingIndexReady,
  isSubmissionListMetadata,
  listBuildingIndex,
  markBuildingIndexReady,
  writeBuildingIndexEntry,
  type SubmissionListMetadata,
} from "./storage/submissions";
import { issueOptions } from "../data/noticeData";

const issueLabelById = new Map<string, string>(issueOptions.map((option) => [option.id, option.label]));

export { formatPublicReadonlyCount, formatResidentReportCount };

export type BuildingSubmission = {
  id: string;
  issue: string;
  issueLabel: string;
  building: string;
  startDate: string;
  reportDate: string;
  reportCount: number;
  createdAt: string;
  status: SubmissionStatus;
  mergedInto?: string;
};

type LoadBuildingSubmissionsOptions = {
  kv: KVNamespace;
  buildingId: string;
  maxEntries?: number;
  batchSize?: number;
};

const fromMetadata = (id: string, metadata: SubmissionListMetadata): BuildingSubmission => ({
  id,
  issue: metadata.issue,
  issueLabel: issueLabelById.get(metadata.issue) || metadata.issue || "Issue",
  building: metadata.building,
  startDate: metadata.startDate,
  reportDate: metadata.reportDate,
  reportCount: Number(metadata.reportCount) || 0,
  createdAt: metadata.createdAt,
  status: normalizeSubmissionStatus(metadata.status),
  ...(metadata.mergedInto ? { mergedInto: metadata.mergedInto } : {}),
});

/** Fast path: list only this building's index keys. No per-record reads when metadata is present. */
const loadFromIndex = async (
  kv: KVNamespace,
  buildingHash: string,
  maxEntries: number,
  batchSize: number
): Promise<BuildingSubmission[]> => {
  const submissions: BuildingSubmission[] = [];
  let cursor: string | undefined;
  do {
    const page = await listBuildingIndex(kv, buildingHash, cursor, batchSize);
    cursor = page.list_complete ? undefined : page.cursor;
    for (const key of page.keys) {
      const id = key.name.slice(key.name.lastIndexOf(":") + 1);
      if (isSubmissionListMetadata(key.metadata)) {
        submissions.push(fromMetadata(id, key.metadata));
      } else {
        const record = parseSubmissionRecord(await kv.get(`submission:${id}`, { type: "json" }));
        if (record) {
          submissions.push(fromMetadata(id, { v: 1, ...record }));
        }
      }
      if (submissions.length >= maxEntries) {
        return submissions;
      }
    }
  } while (cursor);
  return submissions;
};

/**
 * Slow path for buildings whose older records are not indexed yet.
 * Scans every record once, copies this building's records into the index, and marks the index ready.
 */
const loadByScanAndBackfill = async (
  kv: KVNamespace,
  buildingId: string,
  buildingHash: string,
  maxEntries: number,
  batchSize: number
): Promise<BuildingSubmission[]> => {
  const submissions: BuildingSubmission[] = [];
  let cursor: string | undefined;

  do {
    const page = await kv.list({ prefix: "submission:", cursor, limit: batchSize });
    cursor = page.list_complete ? undefined : page.cursor;

    for (const key of page.keys) {
      const metadata = isSubmissionListMetadata(key.metadata) ? key.metadata : null;
      if (metadata && metadata.building !== buildingId) {
        continue;
      }
      const record = parseSubmissionRecord(await kv.get(key.name, { type: "json" }));
      if (!record || record.building !== buildingId) {
        continue;
      }
      await writeBuildingIndexEntry(kv, buildingHash, record);
      if (submissions.length < maxEntries) {
        submissions.push(fromMetadata(record.id, { v: 1, ...record }));
      }
    }
  } while (cursor);

  await markBuildingIndexReady(kv, buildingHash);
  return submissions;
};

export const loadBuildingSubmissions = async ({
  kv,
  buildingId,
  maxEntries = 200,
  batchSize = 100,
}: LoadBuildingSubmissionsOptions): Promise<BuildingSubmission[]> => {
  const buildingHash = await hashBuildingId(buildingId);
  if (await isBuildingIndexReady(kv, buildingHash)) {
    return loadFromIndex(kv, buildingHash, maxEntries, batchSize);
  }
  return loadByScanAndBackfill(kv, buildingId, buildingHash, maxEntries, batchSize);
};
