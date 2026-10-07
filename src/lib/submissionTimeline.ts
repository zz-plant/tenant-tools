import { getNoticeMilestone } from "../data/rules";
import { formatRecordEventLabel, type RecordEvent } from "./recordEvents";

export type SubmissionTimelineEntry = {
  label: string;
  date: string;
};

type SubmissionTimelineInput = {
  startDate?: string;
  reportDate?: string;
  firstMessageDate?: string;
  ticketDate?: string;
  stage: "A" | "B" | "C";
  /** Issue id. Adds the RLTO date counted from the first written notice, when a rule applies. */
  issue?: string;
  /** Dated facts added on the record page. */
  events?: RecordEvent[];
};

const stageUsesFirstNoticeDate: Record<SubmissionTimelineInput["stage"], boolean> = {
  A: false,
  B: true,
  C: true,
};

const reportDateLabelByStage: Record<SubmissionTimelineInput["stage"], string> = {
  A: "Notice sent",
  B: "Follow-up sent",
  C: "Final reminder sent",
};

const pushTimelineEntry = (
  entries: SubmissionTimelineEntry[],
  date: string | undefined,
  label: string
) => {
  if (!date) {
    return;
  }
  entries.push({ label, date });
};

/** The first notice is the report itself at stage A. Later stages record it separately. */
export const getFirstWrittenNoticeDate = (submission: SubmissionTimelineInput) =>
  stageUsesFirstNoticeDate[submission.stage] ? submission.firstMessageDate : submission.reportDate;

export const getSubmissionTimelineEntries = (submission: SubmissionTimelineInput): SubmissionTimelineEntry[] => {
  const entries: SubmissionTimelineEntry[] = [];

  pushTimelineEntry(entries, submission.startDate, "Issue started");

  if (stageUsesFirstNoticeDate[submission.stage]) {
    pushTimelineEntry(entries, submission.firstMessageDate, "First notice sent");
  }

  pushTimelineEntry(entries, submission.reportDate, reportDateLabelByStage[submission.stage]);
  pushTimelineEntry(entries, submission.ticketDate, "311 ticket logged");

  const milestone = getNoticeMilestone(submission.issue, getFirstWrittenNoticeDate(submission));
  if (milestone) {
    pushTimelineEntry(entries, milestone.date, milestone.label);
  }

  (submission.events ?? []).forEach((event) => pushTimelineEntry(entries, event.date, formatRecordEventLabel(event)));

  return entries.sort((a, b) => a.date.localeCompare(b.date));
};
