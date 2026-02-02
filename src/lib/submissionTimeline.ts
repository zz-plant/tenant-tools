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

export const getSubmissionTimelineEntries = (submission: SubmissionTimelineInput): SubmissionTimelineEntry[] => {
  const entries: Array<SubmissionTimelineEntry | null> = [
    submission.startDate ? { label: "Issue started", date: submission.startDate } : null,
    submission.stage === "A" && submission.reportDate
      ? { label: "Notice sent", date: submission.reportDate }
      : null,
    (submission.stage === "B" || submission.stage === "C") && submission.firstMessageDate
      ? { label: "First notice sent", date: submission.firstMessageDate }
      : null,
    (submission.stage === "B" || submission.stage === "C") && submission.reportDate
      ? {
          label: submission.stage === "B" ? "Follow-up sent" : "Final notice sent",
          date: submission.reportDate,
        }
      : null,
    submission.ticketDate ? { label: "311 ticket logged", date: submission.ticketDate } : null,
  ];

  return entries
    .filter((entry): entry is SubmissionTimelineEntry => Boolean(entry))
    .sort((a, b) => a.date.localeCompare(b.date));
};
