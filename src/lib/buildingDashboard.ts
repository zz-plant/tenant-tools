import { normalizeSubmissionStatus, type SubmissionStatus } from "./submissions";

type SubmissionsKv = {
  list: (options: { prefix: string; cursor?: string; limit?: number }) => Promise<{
    keys: Array<{ name: string }>;
    list_complete?: boolean;
    cursor?: string;
  }>;
  get: (key: string, options: { type: "json" }) => Promise<Record<string, unknown> | null>;
};

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
};

type LoadBuildingSubmissionsOptions = {
  kv: SubmissionsKv;
  buildingId: string;
  maxEntries?: number;
  batchSize?: number;
};

export const loadBuildingSubmissions = async ({
  kv,
  buildingId,
  maxEntries = 200,
  batchSize = 50,
}: LoadBuildingSubmissionsOptions): Promise<BuildingSubmission[]> => {
  const submissions: BuildingSubmission[] = [];
  let cursor: string | undefined;

  do {
    const listResult = await kv.list({ prefix: "submission:", cursor, limit: batchSize });
    cursor = listResult.list_complete ? undefined : listResult.cursor;

    for (const key of listResult.keys) {
      const record = await kv.get(key.name, { type: "json" });
      if (!record) {
        continue;
      }
      if (record.building !== buildingId) {
        continue;
      }

      const reportCount =
        typeof record.reportCount === "number" ? record.reportCount : Number(record.reportCount) || 0;

      submissions.push({
        id: String(record.id || ""),
        issue: String(record.issue || ""),
        issueLabel: String(record.issueLabel || record.issue || "Issue"),
        building: String(record.building || ""),
        startDate: String(record.startDate || ""),
        reportDate: String(record.reportDate || ""),
        reportCount,
        createdAt: String(record.createdAt || ""),
        status: normalizeSubmissionStatus(record.status),
      });

      if (submissions.length >= maxEntries) {
        cursor = undefined;
        break;
      }
    }
  } while (cursor);

  return submissions;
};
