import { getNoticeMilestone } from "../data/rules";
import { formatRecordEventLabel, winEventTypes, type RecordEvent, type RecordEventType } from "./recordEvents";

export type SubmissionTimelineEntry = {
  label: string;
  date: string;
  /** A date counted from a rule, not something a resident reported. */
  counted?: boolean;
};

/** The stop on a record's line that an entry can stand for. Ids match `buildRecordLine`. */
export type TimelineStopId = "start" | "notice" | "follow-up" | "final" | "311" | "ward" | "fixed";

/** A timeline entry with the stop it can stand for, for the record page's line of steps and facts. */
export type TaggedTimelineEntry = SubmissionTimelineEntry & { stop?: TimelineStopId };

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

const reportDateStopByStage: Record<SubmissionTimelineInput["stage"], TimelineStopId> = {
  A: "notice",
  B: "follow-up",
  C: "final",
};

const eventStops: Partial<Record<RecordEventType, TimelineStopId>> = {
  follow_up_sent: "follow-up",
  final_notice_sent: "final",
  request_311_filed: "311",
  inspection_done: "311",
  ward_office_asked: "ward",
};

const eventStop = (type: RecordEventType): TimelineStopId | undefined =>
  winEventTypes.includes(type) ? "fixed" : eventStops[type];

const pushTimelineEntry = (
  entries: TaggedTimelineEntry[],
  date: string | undefined,
  label: string,
  { counted = false, stop }: { counted?: boolean; stop?: TimelineStopId } = {}
) => {
  if (!date) {
    return;
  }
  entries.push({ label, date, ...(counted ? { counted } : {}), ...(stop ? { stop } : {}) });
};

/** The first notice is the report itself at stage A. Later stages record it separately. */
export const getFirstWrittenNoticeDate = (submission: SubmissionTimelineInput) =>
  stageUsesFirstNoticeDate[submission.stage] ? submission.firstMessageDate : submission.reportDate;

/** Timeline entries, each tagged with the stop it stands for when it stands for one. */
export const getTaggedTimelineEntries = (submission: SubmissionTimelineInput): TaggedTimelineEntry[] => {
  const entries: TaggedTimelineEntry[] = [];

  pushTimelineEntry(entries, submission.startDate, "Issue started", { stop: "start" });

  if (stageUsesFirstNoticeDate[submission.stage]) {
    pushTimelineEntry(entries, submission.firstMessageDate, "First notice sent", { stop: "notice" });
  }

  pushTimelineEntry(entries, submission.reportDate, reportDateLabelByStage[submission.stage], {
    stop: reportDateStopByStage[submission.stage],
  });
  pushTimelineEntry(entries, submission.ticketDate, "311 ticket logged", { stop: "311" });

  const milestone = getNoticeMilestone(submission.issue, getFirstWrittenNoticeDate(submission));
  if (milestone) {
    pushTimelineEntry(entries, milestone.date, milestone.label, { counted: true });
  }

  (submission.events ?? []).forEach((event) =>
    pushTimelineEntry(entries, event.date, formatRecordEventLabel(event), { stop: eventStop(event.type) })
  );

  return entries.sort((a, b) => a.date.localeCompare(b.date));
};

export const getSubmissionTimelineEntries = (submission: SubmissionTimelineInput): SubmissionTimelineEntry[] =>
  getTaggedTimelineEntries(submission).map(({ label, date, counted }) => (counted ? { label, date, counted } : { label, date }));
