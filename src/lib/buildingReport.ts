import { formatIssueLabel } from "./noticeUtils";
import { formatResidentReportCount } from "./reportCount";
import { submissionStatusLabels, type SubmissionRecord } from "./submissions";

export type BuildingReportRow = {
  id: string;
  issueLabel: string;
  statusLabel: string;
  startDate: string;
  daysOpen: number | null;
  reports: string;
  evidenceOnFile: number;
  ticketDate?: string;
  ticketNumber?: string;
};

export type BuildingReport = {
  building: string;
  generatedOn: string;
  open: BuildingReportRow[];
  closed: BuildingReportRow[];
  notes: string[];
};

const dayMs = 24 * 60 * 60 * 1000;

/** Whole days between two `YYYY-MM-DD` dates, or null when a date is missing or invalid. */
export const daysBetween = (start: string, end: string) => {
  const startMs = Date.parse(`${start}T00:00:00Z`);
  const endMs = Date.parse(`${end}T00:00:00Z`);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    return null;
  }
  return Math.max(0, Math.round((endMs - startMs) / dayMs));
};

const toRow = (record: SubmissionRecord, today: string): BuildingReportRow => ({
  id: record.id,
  issueLabel: formatIssueLabel(record.issueLabel || record.issue),
  statusLabel: submissionStatusLabels[record.status],
  startDate: record.startDate || "Not listed",
  daysOpen: record.status === "open" ? daysBetween(record.startDate, today) : null,
  // Small counts are bucketed so a printed report cannot single out one resident.
  reports: formatResidentReportCount(record.reportCount),
  evidenceOnFile: record.evidenceCount ?? 0,
  ticketDate: record.ticketDate,
  ticketNumber: record.ticketNumber,
});

/**
 * Printable summary for inspectors and legal aid.
 * Only structured facts: issue type, dates, bucketed counts, 311 ticket, evidence count.
 * No free-text details, no zones, no evidence files, and no merged duplicates.
 */
export const buildBuildingReport = (building: string, records: SubmissionRecord[], today: string): BuildingReport => {
  const rows = records
    .filter((record) => record.building === building && !record.mergedInto)
    .map((record) => toRow(record, today));
  const open = rows
    .filter((row) => row.daysOpen !== null)
    .sort((left, right) => (right.daysOpen ?? 0) - (left.daysOpen ?? 0));
  const closed = rows
    .filter((row) => row.daysOpen === null)
    .sort((left, right) => right.startDate.localeCompare(left.startDate));
  return {
    building,
    generatedOn: today,
    open,
    closed,
    notes: [
      "Resident-reported. Not verified.",
      "Report counts under 3 are shown as <3 to protect residents.",
      "Evidence files are stored privately. Only the number of files is shown.",
    ],
  };
};
