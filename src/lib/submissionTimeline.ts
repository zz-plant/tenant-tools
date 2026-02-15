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
};

const stageUsesFirstNoticeDate: Record<SubmissionTimelineInput["stage"], boolean> = {
  A: false,
  B: true,
  C: true,
};

const reportDateLabelByStage: Record<SubmissionTimelineInput["stage"], string> = {
  A: "Notice sent",
  B: "Follow-up sent",
  C: "Final notice sent",
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

export const getSubmissionTimelineEntries = (submission: SubmissionTimelineInput): SubmissionTimelineEntry[] => {
  const entries: SubmissionTimelineEntry[] = [];

  pushTimelineEntry(entries, submission.startDate, "Issue started");

  if (stageUsesFirstNoticeDate[submission.stage]) {
    pushTimelineEntry(entries, submission.firstMessageDate, "First notice sent");
  }

  pushTimelineEntry(entries, submission.reportDate, reportDateLabelByStage[submission.stage]);
  pushTimelineEntry(entries, submission.ticketDate, "311 ticket logged");

  return entries.sort((a, b) => a.date.localeCompare(b.date));
};
