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
  };
};

export const updateSubmissionStatusRecord = (record: SubmissionRecord, status: SubmissionStatus): SubmissionRecord => ({
  ...record,
  status,
});

export const incrementSubmissionReportCount = (record: SubmissionRecord, increment: number): SubmissionRecord => ({
  ...record,
  reportCount: Math.min(50, record.reportCount + increment),
});

export const createSubmissionReportEntry = (submissionId: string) => createReportEntry(submissionId);
