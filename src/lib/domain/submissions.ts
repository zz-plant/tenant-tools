import { issueOptions } from "../../data/noticeData";
import { createReportEntry } from "../reports";
import type {
  SubmissionInput,
  SubmissionRecord,
  SubmissionStatus
} from "../submissions";

export const createSubmissionRecord = (data: SubmissionInput): SubmissionRecord => {
  const issueLabel = issueOptions.find((issue) => issue.id === data.issue)?.label ?? data.issue;
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "open",
    issueLabel,
    ...data,
    baseReportCount: data.reportCount,
  };
};

export const updateSubmissionStatusRecord = (record: SubmissionRecord, status: SubmissionStatus): SubmissionRecord => ({
  ...record,
  status,
});

/**
 * Base count for records saved before `baseReportCount` existed.
 * Their stored count already includes any "me too" markers written so far.
 */
export const resolveBaseReportCount = (record: SubmissionRecord, markerCount: number) =>
  record.baseReportCount ?? Math.max(0, record.reportCount - (record.mergedReportCount ?? 0) - markerCount);

/**
 * KV has no atomic increment. Two "me too" taps at the same moment could overwrite each other if
 * the count were read, increased, and written back. Instead each tap writes its own marker key,
 * and the count is rebuilt from the base count, merged count, and number of markers.
 * A stale count heals on the next tap or the next record page view.
 */
export const reconcileReportCount = (record: SubmissionRecord, markerCount: number): SubmissionRecord => {
  const baseReportCount = resolveBaseReportCount(record, markerCount);
  return {
    ...record,
    baseReportCount,
    reportCount: baseReportCount + (record.mergedReportCount ?? 0) + markerCount,
  };
};

export const createSubmissionReportEntry = (submissionId: string) => createReportEntry(submissionId);
