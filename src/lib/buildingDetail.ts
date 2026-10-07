import { loadBuildingSubmissions, type BuildingSubmission } from "./buildingDashboard";
import type { RecordEvent } from "./recordEvents";
import { listRecordEvents } from "./storage/recordEvents";
import { fetchSubmissionRecord } from "./storage/submissions";
import type { SubmissionRecord, SubmissionStatus } from "./submissions";

export type BuildingDetail = {
  summaries: BuildingSubmission[];
  /** Full records, merged duplicates left out. */
  records: SubmissionRecord[];
  eventsByRecord: Map<string, RecordEvent[]>;
};

/**
 * Full records and dated facts for one building, for the follow-up list, meeting report, and
 * 311 day page. One KV read and one KV listing per record.
 */
export const loadBuildingDetail = async (
  kv: KVNamespace,
  buildingId: string,
  options: { maxEntries?: number; statuses?: SubmissionStatus[] } = {}
): Promise<BuildingDetail> => {
  const summaries = await loadBuildingSubmissions({ kv, buildingId, maxEntries: options.maxEntries ?? 200 });
  const records: SubmissionRecord[] = [];
  const eventsByRecord = new Map<string, RecordEvent[]>();
  const wanted = summaries.filter(
    (entry) => !entry.mergedInto && (!options.statuses || options.statuses.includes(entry.status))
  );
  for (const summary of wanted) {
    const record = await fetchSubmissionRecord(kv, summary.id);
    if (record && record.building === buildingId && !record.mergedInto) {
      records.push(record);
      eventsByRecord.set(record.id, await listRecordEvents(kv, record.id));
    }
  }
  return { summaries, records, eventsByRecord };
};
