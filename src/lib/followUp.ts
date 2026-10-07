import { getNoticeMilestone } from "../data/rules";
import { issue311Guidance } from "../data/notice/guidance";
import { formatTimelineDate } from "./dateUtils";
import { formatIssueLabel } from "./noticeUtils";
import { formatRecordEventLabel, winEventTypes, type RecordEvent, type RecordEventType } from "./recordEvents";
import { formatResidentReportCount } from "./reportCount";
import { describeCanvass, type Canvass } from "./canvass";
import { getFirstWrittenNoticeDate } from "./submissionTimeline";
import type { SubmissionRecord } from "./submissions";

/*
 * "Needs follow-up" for the dashboard and meeting report, plus wins.
 * Messages are calm and literal (AGENTS.md §6.2): "qualifies for a 311 inspection", not "escalate".
 */

export type FollowUpKind = "reply_overdue" | "promise_missed" | "rlto_period_passed" | "qualifies_311";

export type FollowUpItem = {
  recordId: string;
  issueLabel: string;
  kind: FollowUpKind;
  date: string;
  message: string;
};

/** Same day the notice builder unlocks the final reminder; after it, a 311 inspection is the next normal step. */
export const inspectionQualifyingDays = 6;

const dayMs = 24 * 60 * 60 * 1000;
const daysBetween = (start: string, end: string) =>
  Math.floor((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / dayMs);

const latestOfType = (events: RecordEvent[], type: RecordEventType) =>
  events.filter((event) => event.type === type).sort((a, b) => b.date.localeCompare(a.date))[0];

const hasType = (events: RecordEvent[], types: RecordEventType[]) => events.some((event) => types.includes(event.type));

const labelOf = (record: SubmissionRecord) => formatIssueLabel(record.issueLabel || record.issue);

export const buildFollowUpItems = (
  records: SubmissionRecord[],
  eventsByRecord: Map<string, RecordEvent[]>,
  today: string
): FollowUpItem[] => {
  const items: FollowUpItem[] = [];
  records
    .filter((record) => record.status === "open" && !record.mergedInto)
    .forEach((record) => {
      const events = eventsByRecord.get(record.id) ?? [];
      const issueLabel = labelOf(record);
      const push = (kind: FollowUpKind, date: string, message: string) =>
        items.push({ recordId: record.id, issueLabel, kind, date, message });

      const replyDue = latestOfType(events, "reply_due");
      const sentOn = record.reportDate || record.startDate;
      const replied = events.some((event) => event.type === "management_replied" && event.date >= sentOn);
      if (replyDue && replyDue.date < today && !replied) {
        push("reply_overdue", replyDue.date, `Reply was due ${formatTimelineDate(replyDue.date)}. No reply is logged.`);
      }

      const promise = latestOfType(events, "repair_date_promised");
      if (promise && promise.date < today && !hasType(events, winEventTypes)) {
        push("promise_missed", promise.date, `Promised repair date ${formatTimelineDate(promise.date)} has passed.`);
      }

      const milestone = getNoticeMilestone(record.issue, getFirstWrittenNoticeDate(record));
      if (milestone && milestone.date < today) {
        push("rlto_period_passed", milestone.date, `${milestone.label}: ${formatTimelineDate(milestone.date)}. Talk to legal aid about next steps.`);
      }

      const has311 =
        Boolean(record.ticketNumber || record.ticketDate) || hasType(events, ["request_311_filed", "inspection_done"]);
      if (
        record.issue in issue311Guidance &&
        record.startDate &&
        daysBetween(record.startDate, today) >= inspectionQualifyingDays &&
        !has311
      ) {
        push("qualifies_311", record.startDate, "This issue qualifies for a 311 inspection. No 311 request is logged.");
      }
    });
  return items.sort((a, b) => a.date.localeCompare(b.date) || a.issueLabel.localeCompare(b.issueLabel));
};

export type WinSummary = {
  total: number;
  afterLetter: number;
  after311: number;
};

/** Records with a "fixed" fact. A record counts once, by its latest win fact. */
export const summarizeWins = (records: SubmissionRecord[], eventsByRecord: Map<string, RecordEvent[]>, since?: string) => {
  const summary: WinSummary = { total: 0, afterLetter: 0, after311: 0 };
  records.forEach((record) => {
    const wins = (eventsByRecord.get(record.id) ?? [])
      .filter((event) => winEventTypes.includes(event.type) && (!since || event.date >= since))
      .sort((a, b) => b.date.localeCompare(a.date));
    const latest = wins[0];
    if (!latest) {
      return;
    }
    summary.total += 1;
    if (latest.type === "fixed_after_letter") {
      summary.afterLetter += 1;
    }
    if (latest.type === "fixed_after_311") {
      summary.after311 += 1;
    }
  });
  return summary;
};

const addDaysIso = (isoDate: string, days: number) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
};

export type MeetingReport = {
  building: string;
  today: string;
  overview: { open: string; newLast30Days: string; winsLast90Days: number };
  followUp: FollowUpItem[];
  topProblems: Array<{ id: string; issueLabel: string; startDate: string; daysOpen: number; reports: string; lastFact: string }>;
  replies: { requested: number; received: number; missing: number };
  upcoming: Array<{ date: string; issueLabel: string; label: string }>;
  wins: Array<{ date: string; issueLabel: string; label: string }>;
  /** Latest canvass, described with bucketed counts. */
  canvass: string | null;
  notes: string[];
};

/** One page for a union meeting. Counts of people are bucketed; counts of records are not. */
export const buildMeetingReport = ({
  building,
  records,
  eventsByRecord,
  today,
  canvasses = [],
}: {
  building: string;
  records: SubmissionRecord[];
  eventsByRecord: Map<string, RecordEvent[]>;
  today: string;
  /** Newest first. */
  canvasses?: Canvass[];
}): MeetingReport => {
  const live = records.filter((record) => !record.mergedInto);
  const open = live.filter((record) => record.status === "open");
  const monthAgo = addDaysIso(today, -30);
  const quarterAgo = addDaysIso(today, -90);
  const twoWeeksAhead = addDaysIso(today, 14);

  const topProblems = open
    .map((record) => {
      const events = eventsByRecord.get(record.id) ?? [];
      const last = [...events].sort((a, b) => b.date.localeCompare(a.date))[0];
      return {
        id: record.id,
        issueLabel: labelOf(record),
        startDate: record.startDate,
        daysOpen: record.startDate ? Math.max(0, daysBetween(record.startDate, today)) : 0,
        reports: formatResidentReportCount(record.reportCount),
        lastFact: last ? `${formatTimelineDate(last.date)}: ${formatRecordEventLabel(last)}` : "None",
      };
    })
    .sort((a, b) => b.daysOpen - a.daysOpen)
    .slice(0, 10);

  const withRequest = open.filter((record) => (eventsByRecord.get(record.id) ?? []).some((event) => event.type === "reply_due"));
  const received = withRequest.filter((record) =>
    (eventsByRecord.get(record.id) ?? []).some(
      (event) => event.type === "management_replied" && event.date >= (record.reportDate || record.startDate)
    )
  ).length;

  const upcoming = open
    .flatMap((record) =>
      (eventsByRecord.get(record.id) ?? [])
        .filter(
          (event) =>
            (event.type === "reply_due" || event.type === "repair_date_promised") &&
            event.date >= today &&
            event.date <= twoWeeksAhead
        )
        .map((event) => ({ date: event.date, issueLabel: labelOf(record), label: formatRecordEventLabel(event) }))
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const wins = live
    .flatMap((record) =>
      (eventsByRecord.get(record.id) ?? [])
        .filter((event) => winEventTypes.includes(event.type) && event.date >= quarterAgo)
        .map((event) => ({ date: event.date, issueLabel: labelOf(record), label: formatRecordEventLabel(event) }))
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  return {
    building,
    today,
    overview: {
      open: String(open.length),
      newLast30Days: String(live.filter((record) => (record.startDate || record.createdAt.slice(0, 10)) >= monthAgo).length),
      winsLast90Days: summarizeWins(live, eventsByRecord, quarterAgo).total,
    },
    followUp: buildFollowUpItems(live, eventsByRecord, today),
    topProblems,
    replies: { requested: withRequest.length, received, missing: withRequest.length - received },
    upcoming,
    wins,
    canvass: canvasses[0] ? describeCanvass(canvasses[0]) : null,
    notes: [
      "Resident-reported. Not verified.",
      "Counts of residents under 3 show as <3.",
      "Information only. Not legal advice.",
    ],
  };
};
