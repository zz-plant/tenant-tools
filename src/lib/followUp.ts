import { getNoticeMilestone } from "../data/rules";
import { issue311Guidance } from "../data/notice/guidance";
import { formatTimelineDate } from "./dateUtils";
import { formatIssueLabel, noticeUnlockDays } from "./noticeUtils";
import { formatRecordEventLabel, winEventTypes, type RecordEvent, type RecordEventType } from "./recordEvents";
import { formatResidentReportCount } from "./reportCount";
import { describeCanvass, type Canvass } from "./canvass";
import { getFirstWrittenNoticeDate } from "./submissionTimeline";
import type { SubmissionRecord } from "./submissions";

/*
 * "Needs follow-up" for the dashboard and meeting report, plus wins.
 * Messages are calm and literal (AGENTS.md §6.2): "qualifies for a 311 inspection", not "escalate".
 */

export type FollowUpKind = "reply_overdue" | "promise_missed" | "rlto_period_passed" | "qualifies_311" | "ward_office";

/** Notice stages, as in the notice builder: A first notice, B follow-up, C final reminder. */
export type NoticeStage = "A" | "B" | "C";

/** One tap from a follow-up item: add a dated fact, send the next notice, or open a group letter. */
export type FollowUpAction =
  | { kind: "fact"; fact: RecordEventType; label: string }
  | { kind: "notice"; stage: NoticeStage; label: string }
  | { kind: "letter"; letter: "alderperson"; label: string };

export type FollowUpItem = {
  recordId: string;
  building: string;
  issueLabel: string;
  kind: FollowUpKind;
  date: string;
  message: string;
  action: FollowUpAction;
};

export const noticeStageActionLabels: Record<NoticeStage, string> = {
  A: "Send the notice again",
  B: "Send a follow-up",
  C: "Send the final reminder",
};

/**
 * Notices sent on time, from a record and its dated facts. Only these move the next step, so a
 * fact dated too early (by mistake, or added straight to the API) is kept on the timeline as the
 * resident reported it, but it unlocks nothing. This is why the API does not need its own unlock check.
 * - A follow-up counts from day 3 after the start date.
 * - A final reminder counts from day 6, and at least 3 days after a follow-up that counts.
 * A record saved at stage B or C in the notice builder counts as that notice on its report date.
 */
export const countedNotices = (
  record: Pick<SubmissionRecord, "stage" | "startDate" | "reportDate">,
  events: RecordEvent[]
): { followUpDates: string[]; finalDate?: string } => {
  const start = record.startDate || record.reportDate;
  if (!start) {
    return { followUpDates: [] };
  }
  const followUpOpens = addDaysIso(start, noticeUnlockDays.followUp);
  const finalOpens = addDaysIso(start, noticeUnlockDays.finalReminder);
  const followUpDates = [
    ...events.filter((event) => event.type === "follow_up_sent").map((event) => event.date),
    ...(record.stage === "B" && record.reportDate ? [record.reportDate] : []),
  ]
    .filter((date) => date >= followUpOpens)
    .sort();
  const firstFollowUp = followUpDates[0];
  const finalDates = events
    .filter((event) => event.type === "final_notice_sent")
    .map((event) => event.date)
    .filter((date) => date >= finalOpens && Boolean(firstFollowUp) && date >= addDaysIso(firstFollowUp, noticeUnlockDays.followUp));
  // A record saved as a final reminder means the earlier notices went out before it was saved.
  if (record.stage === "C" && record.reportDate && record.reportDate >= finalOpens) {
    finalDates.push(record.reportDate);
  }
  return { followUpDates, finalDate: finalDates.sort()[0] };
};

/**
 * The next notice for a saved record. Steps unlock by days open, as in the notice builder
 * (AGENTS.md §6.1): a follow-up from day 3, a final reminder from day 6. The final reminder also
 * waits 3 days after the latest follow-up, so two notices never go out back to back.
 * `unlockDate` is set when the next step is still locked.
 */
export const nextNoticeStage = (
  record: Pick<SubmissionRecord, "stage" | "startDate" | "reportDate">,
  events: RecordEvent[],
  today: string
): { stage: NoticeStage; unlockDate?: string } => {
  const start = record.startDate || record.reportDate || today;
  const open = Math.max(0, daysBetween(start, today));
  const counted = countedNotices({ ...record, startDate: start }, events);
  if (counted.finalDate) {
    return { stage: "C" };
  }
  const lastFollowUp = counted.followUpDates.at(-1);
  if (lastFollowUp) {
    const unlockDate = [
      addDaysIso(start, noticeUnlockDays.finalReminder),
      addDaysIso(lastFollowUp, noticeUnlockDays.followUp),
    ].sort()[1];
    return today >= unlockDate ? { stage: "C" } : { stage: "B", unlockDate };
  }
  return open >= noticeUnlockDays.followUp
    ? { stage: "B" }
    : { stage: "A", unlockDate: addDaysIso(start, noticeUnlockDays.followUp) };
};

/**
 * Builder link that prefills a notice from a saved record. The builder asks the server for the
 * next step (GET /api/submissions/{id} returns `nextNotice`), so the link carries no stage.
 */
export const buildRecordNoticeUrl = (recordId: string) => `/?record=${encodeURIComponent(recordId)}#builder`;

/** Record page link that opens "Add a dated fact" with the type already chosen. */
export const buildRecordFactUrl = (recordId: string, fact: RecordEventType) =>
  `/submissions/${encodeURIComponent(recordId)}?fact=${fact}#facts`;

/** Joint letter page with the meeting request to the ward office already chosen. */
export const buildWardOfficeLetterUrl = (building: string) =>
  `/buildings/${encodeURIComponent(building)}/letter?kind=alderperson`;

export const followUpActionHref = (item: FollowUpItem) =>
  item.action.kind === "fact"
    ? buildRecordFactUrl(item.recordId, item.action.fact)
    : item.action.kind === "letter"
      ? buildWardOfficeLetterUrl(item.building)
      : buildRecordNoticeUrl(item.recordId);

/**
 * The one next step for an open record, for its dashboard row and the dashboard's next-step sign.
 * A "Needs follow-up" item comes first (a missing reply, a missed repair date, 311). Otherwise it is
 * the next notice, or the date it unlocks. After the final reminder the step is "done": the
 * follow-up items carry the next normal step from there.
 */
export type RecordNextStep = {
  label: string;
  href: string;
  state: "ready" | "locked" | "done";
  /** What the button opens: the notice builder, a dated fact, a group letter, or the record itself. */
  opens: "notice" | "fact" | "letter" | "record";
  note?: string;
};

export const nextStepForRecord = (
  record: SubmissionRecord,
  events: RecordEvent[],
  today: string,
  followUpItems: FollowUpItem[]
): RecordNextStep => {
  const item = followUpItems.find((entry) => entry.recordId === record.id);
  if (item) {
    return {
      label: item.action.label,
      href: followUpActionHref(item),
      state: "ready",
      opens: item.action.kind,
      note: item.message,
    };
  }
  const recordHref = `/submissions/${encodeURIComponent(record.id)}`;
  const start = record.startDate || record.reportDate || today;
  if (countedNotices({ ...record, startDate: start }, events).finalDate) {
    return { label: "Final reminder sent", href: recordHref, state: "done", opens: "record" };
  }
  const next = nextNoticeStage(record, events, today);
  if (next.unlockDate) {
    const step = next.stage === "A" ? "Follow-up" : "Final reminder";
    return { label: `${step} from ${formatTimelineDate(next.unlockDate)}`, href: recordHref, state: "locked", opens: "record" };
  }
  return { label: noticeStageActionLabels[next.stage], href: buildRecordNoticeUrl(record.id), state: "ready", opens: "notice" };
};

/** Button text for a ready step: a fact step names its action ("Add my 311 number"), as on its row. */
export const nextStepButtonLabel = (step: RecordNextStep) =>
  step.opens === "notice"
    ? "Open the notice"
    : step.opens === "fact" || step.opens === "letter"
      ? step.label
      : "Open the record";

/** Whole days from the start date to today. Never negative. */
export const daysOpen = (startDate: string, today: string) =>
  startDate ? Math.max(0, daysBetween(startDate, today)) : 0;

/** Same day the notice builder unlocks the final reminder; after it, a 311 inspection is the next normal step. */
export const inspectionQualifyingDays = 6;

/**
 * Days after a 311 request before the dashboard suggests asking the ward office for a meeting.
 * Two weeks gives the City time to schedule an inspection first. It is a waiting rule for this app,
 * not a legal deadline. The suggestion names the office ("Office of the Alderperson"), never a person.
 */
export const wardOfficeWaitDays = 14;

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
      const push = (kind: FollowUpKind, date: string, message: string, action: FollowUpAction) =>
        items.push({ recordId: record.id, building: record.building, issueLabel, kind, date, message, action });

      const replyDue = latestOfType(events, "reply_due");
      const sentOn = record.reportDate || record.startDate;
      // A new "reply requested by" date starts a new cycle. Only a reply after the earlier due date counts for it.
      const previousDue = replyDue
        ? events
            .filter((event) => event.type === "reply_due" && event.date < replyDue.date)
            .sort((a, b) => b.date.localeCompare(a.date))[0]
        : undefined;
      const replied = events.some(
        (event) =>
          event.type === "management_replied" && event.date >= sentOn && (!previousDue || event.date > previousDue.date)
      );
      if (replyDue && replyDue.date < today && !replied) {
        push("reply_overdue", replyDue.date, `Reply was due ${formatTimelineDate(replyDue.date)}. No reply is logged.`, {
          kind: "fact",
          fact: "management_replied",
          label: "Log a reply",
        });
      }

      const promise = latestOfType(events, "repair_date_promised");
      if (promise && promise.date < today && !hasType(events, winEventTypes)) {
        push("promise_missed", promise.date, `Promised repair date ${formatTimelineDate(promise.date)} has passed.`, {
          kind: "fact",
          fact: "repair_completed",
          label: "Log the repair",
        });
      }

      // After the final reminder there is no next notice to offer; 311 and the ward office carry on from there.
      const finalSent = countedNotices({ ...record, startDate: record.startDate || record.reportDate }, events).finalDate;
      const milestone = getNoticeMilestone(record.issue, getFirstWrittenNoticeDate(record));
      if (milestone && milestone.date < today && !finalSent) {
        const next = nextNoticeStage(record, events, today);
        push("rlto_period_passed", milestone.date, `${milestone.label}: ${formatTimelineDate(milestone.date)}. Talk to legal aid about next steps.`, {
          kind: "notice",
          stage: next.stage,
          label: noticeStageActionLabels[next.stage],
        });
      }

      const has311 =
        Boolean(record.ticketNumber || record.ticketDate) || hasType(events, ["request_311_filed", "inspection_done"]);
      if (
        record.issue in issue311Guidance &&
        record.startDate &&
        daysBetween(record.startDate, today) >= inspectionQualifyingDays &&
        !has311
      ) {
        push("qualifies_311", record.startDate, "This issue qualifies for a 311 inspection. Call 311 or use 311.chicago.gov, then add the 311 number here.", {
          kind: "fact",
          fact: "request_311_filed",
          label: "Add my 311 number",
        });
      }

      // City work is the ward office's project, so for it the ward office is the first step, not the last.
      const wardAsked = events.filter((event) => event.type === "ward_office_asked").map((event) => event.date).sort().at(-1);
      if (record.issue === "city-work" && !wardAsked && !hasType(events, winEventTypes)) {
        push(
          "ward_office",
          record.startDate || record.reportDate,
          "City work is the ward office's project. You can ask the ward office for help.",
          { kind: "letter", letter: "alderperson", label: "Ask the ward office for help" }
        );
      }

      // For other problems the ward office comes last: after the final reminder, after 311, and only while nothing is fixed.
      const dates311 = [
        record.ticketDate,
        ...events.filter((event) => event.type === "request_311_filed" || event.type === "inspection_done").map((event) => event.date),
      ].filter((date): date is string => Boolean(date));
      const latest311 = dates311.sort().at(-1);
      const askedSince311 = Boolean(wardAsked && latest311 && wardAsked >= latest311);
      if (record.issue !== "city-work" && finalSent && latest311 && !askedSince311 && !hasType(events, winEventTypes)) {
        const unlocks = addDaysIso(latest311, wardOfficeWaitDays);
        if (today >= unlocks) {
          push(
            "ward_office",
            unlocks,
            `311 was asked on ${formatTimelineDate(latest311)}. No repair is logged. You can ask the ward office for a meeting.`,
            { kind: "letter", letter: "alderperson", label: "Ask the ward office for a meeting" }
          );
        }
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

/**
 * A record's steps as stops on a line, like an 'L' line map: problem started, notice, follow-up,
 * final reminder, 311 request, fixed. Each stop is done, open now, locked until a date, or later.
 * More than one stop can be open at once (the final reminder and 311 often are); the record's
 * single next step is still `nextStepForRecord`.
 */
export type LineStopState = "done" | "open" | "locked" | "later";
export type LineStop = { id: string; label: string; state: LineStopState; date?: string };

export const buildRecordLine = (record: SubmissionRecord, events: RecordEvent[], today: string): LineStop[] => {
  const start = record.startDate || record.reportDate || today;
  const counted = countedNotices({ ...record, startDate: start }, events);
  const next = nextNoticeStage({ ...record, startDate: start }, events, today);
  const firstNotice = getFirstWrittenNoticeDate(record) || record.reportDate;
  const ticket = events.find((event) => event.type === "request_311_filed" || event.type === "inspection_done");
  const has311 = Boolean(record.ticketNumber || record.ticketDate || ticket);
  const win = events
    .filter((event) => winEventTypes.includes(event.type))
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const fixed = Boolean(win) || record.status === "resolved";
  const noticeStop = (stage: "B" | "C", doneDate?: string): Pick<LineStop, "state" | "date"> => {
    if (doneDate) {
      return { state: "done", date: doneDate };
    }
    if (fixed) {
      return { state: "later" };
    }
    if (next.stage === stage && !next.unlockDate) {
      return { state: "open" };
    }
    // nextNoticeStage reports the follow-up's unlock date as stage A, and the final reminder's as stage B.
    const unlocksThis = next.unlockDate && ((stage === "B" && next.stage === "A") || (stage === "C" && next.stage === "B"));
    return unlocksThis ? { state: "locked", date: next.unlockDate } : { state: "later" };
  };
  const qualifies311 = record.issue in issue311Guidance && daysOpen(start, today) >= inspectionQualifyingDays;
  // City work goes to the ward office instead of 311, so that stop is the ward office.
  const wardAsked = events.find((event) => event.type === "ward_office_asked");
  const cityStop: LineStop =
    record.issue === "city-work"
      ? wardAsked
        ? { id: "ward", label: "Ward", state: "done", date: wardAsked.date }
        : { id: "ward", label: "Ward", state: fixed ? "later" : "open" }
      : {
          id: "311",
          label: "311",
          ...(has311
            ? { state: "done" as const, date: record.ticketDate || ticket?.date }
            : { state: (qualifies311 && !fixed ? "open" : "later") as LineStopState }),
        };
  return [
    { id: "start", label: "Started", state: "done", date: start },
    { id: "notice", label: "Notice", ...(firstNotice ? { state: "done" as const, date: firstNotice } : { state: "open" as const }) },
    { id: "follow-up", label: "Follow-up", ...noticeStop("B", counted.followUpDates[0]) },
    { id: "final", label: "Final", ...noticeStop("C", counted.finalDate) },
    cityStop,
    { id: "fixed", label: "Fixed", ...(fixed ? { state: "done" as const, date: win?.date } : { state: "later" as const }) },
  ];
};
