import { loadBuildingSubmissions } from "./buildingDashboard";
import { formatRecordEventLabel, type RecordEvent } from "./recordEvents";
import { deleteEvidenceRecord, listEvidenceRecords } from "./storage/evidence";
import { listRecordEvents } from "./storage/recordEvents";
import { fetchSubmissionRecord, hashBuildingId } from "./storage/submissions";
import type { SubmissionRecord } from "./submissions";

/*
 * Steward tools for a union that runs its own copy: export all of a building's data, or wipe it.
 * Exports hold records and dated facts only. They never hold "me too" session markers,
 * evidence files, or keys.
 */

export type BuildingExportRecord = SubmissionRecord & { events: RecordEvent[] };

export type BuildingExport = {
  building: string;
  exportedAt: string;
  notes: string[];
  records: BuildingExportRecord[];
};

const exportNotes = [
  "Resident-reported. Not verified.",
  "No names, keys, or evidence files are included. Evidence is listed as a count.",
];

/** Upper bound for one building. Larger buildings are exported in the first 5,000 records. */
const maxExportRecords = 5000;

export const collectBuildingExport = async (
  kv: KVNamespace,
  building: string,
  now: Date = new Date()
): Promise<BuildingExport> => {
  const summaries = await loadBuildingSubmissions({ kv, buildingId: building, maxEntries: maxExportRecords });
  const records: BuildingExportRecord[] = [];
  for (const summary of summaries) {
    const record = await fetchSubmissionRecord(kv, summary.id);
    if (record && record.building === building) {
      records.push({ ...record, events: await listRecordEvents(kv, record.id) });
    }
  }
  records.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  return { building, exportedAt: now.toISOString(), notes: exportNotes, records };
};

const csvColumns = [
  "id",
  "issue",
  "issue_label",
  "status",
  "start_date",
  "report_date",
  "first_message_date",
  "residents_reporting",
  "zone",
  "stage",
  "ticket_date",
  "ticket_number",
  "evidence_count",
  "merged_into",
  "details",
  "dated_facts",
] as const;

/** Quotes a CSV cell. Cells that start with = + - @ get a leading quote so spreadsheets do not run them. */
export const csvCell = (value: string | number | undefined) => {
  let text = value === undefined ? "" : String(value);
  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toBuildingExportCsv = (data: BuildingExport) => {
  const rows = data.records.map((record) =>
    [
      record.id,
      record.issue,
      record.issueLabel,
      record.status,
      record.startDate,
      record.reportDate,
      record.firstMessageDate,
      record.reportCount,
      record.zone,
      record.stage,
      record.ticketDate,
      record.ticketNumber,
      record.evidenceCount ?? 0,
      record.mergedInto,
      Object.entries(record.issueDetails)
        .map(([key, value]) => `${key}: ${value}`)
        .join("; "),
      record.events.map((event) => `${event.date} ${formatRecordEventLabel(event)}`).join("; "),
    ]
      .map(csvCell)
      .join(",")
  );
  return [csvColumns.join(","), ...rows].join("\r\n") + "\r\n";
};

const deletePrefix = async (kv: KVNamespace, prefix: string) => {
  let deleted = 0;
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix, cursor, limit: 1000 });
    for (const key of page.keys) {
      await kv.delete(key.name);
      deleted += 1;
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return deleted;
};

/** Removes one record and everything stored with it: facts, "me too" markers, report log, evidence. */
const deleteRecordData = async (kv: KVNamespace, bucket: R2Bucket | null, id: string, buildingHash: string) => {
  for (const evidence of await listEvidenceRecords(kv, id)) {
    if (bucket) {
      await bucket.delete(evidence.objectKey);
    }
    await deleteEvidenceRecord(kv, id, evidence.id);
  }
  for (const prefix of [`evidence:${id}:`, `revt:${id}:`, `metoo:${id}:`, `report:${id}:`]) {
    await deletePrefix(kv, prefix);
  }
  await kv.delete(`submission:${id}`);
  await kv.delete(`bidx:${buildingHash}:${id}`);
};

/**
 * Emergency wipe, in small batches so one request stays inside Workers limits.
 * Call again until `remaining` is 0. The building key is not changed: rotate it separately.
 */
export const wipeBuildingBatch = async (
  kv: KVNamespace,
  bucket: R2Bucket | null,
  building: string,
  batchSize = 5
) => {
  const buildingHash = await hashBuildingId(building);
  const batch = await loadBuildingSubmissions({ kv, buildingId: building, maxEntries: batchSize });
  for (const summary of batch) {
    await deleteRecordData(kv, bucket, summary.id, buildingHash);
  }
  let extraDeleted = 0;
  const left = await kv.list({ prefix: `bidx:${buildingHash}:`, limit: 1 });
  if (left.keys.length === 0) {
    extraDeleted = await deletePrefix(kv, `canvass:${buildingHash}:`);
  }
  return { deleted: batch.length, otherDeleted: extraDeleted, remaining: left.keys.length > 0 };
};
