import { issue311Guidance } from "../data/notice/guidance";
import { formatTimelineDate } from "./dateUtils";
import { formatIssueLabel } from "./noticeUtils";
import type { RecordEvent } from "./recordEvents";
import { formatResidentReportCount } from "./reportCount";
import type { SubmissionRecord } from "./submissions";

/*
 * Group 311 day: residents each make their own 311 request about the same problems on the
 * same day. This builds the per-problem scripts and counts the 311 requests logged so far.
 */

export type Group311Item = {
  recordId: string;
  issueLabel: string;
  category: string;
  script: string;
  startDate: string;
  /** 311 requests logged on the record, bucketed under 3. */
  requestsLogged: string;
};

/** Fills the 311 script with the record's own facts. Missing facts stay as visible placeholders. */
export const fill311Script = (script: string, record: SubmissionRecord) =>
  script
    .replace("[START DATE]", record.startDate ? formatTimelineDate(record.startDate) : "[START DATE]")
    .replace("[LOCATION]", record.issueDetails.location || "[LOCATION]")
    .replace("[DATE]", record.issueDetails.eventDate || "[DATE]");

export const count311Requests = (record: SubmissionRecord, events: RecordEvent[]) =>
  events.filter((event) => event.type === "request_311_filed").length + (record.ticketNumber ? 1 : 0);

export const buildGroup311Items = (
  records: SubmissionRecord[],
  eventsByRecord: Map<string, RecordEvent[]>
): Group311Item[] =>
  records
    .filter((record) => record.status === "open" && !record.mergedInto && record.issue in issue311Guidance)
    .sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""))
    .map((record) => {
      const guidance = issue311Guidance[record.issue as keyof typeof issue311Guidance];
      return {
        recordId: record.id,
        issueLabel: formatIssueLabel(record.issueLabel || record.issue),
        category: guidance.category,
        script: fill311Script(guidance.script, record),
        startDate: record.startDate,
        requestsLogged: formatResidentReportCount(count311Requests(record, eventsByRecord.get(record.id) ?? [])),
      };
    });

/** Text for the resident group chat. No address, no key, no link with a key. */
export const buildGroup311Message = (items: Group311Item[], day: string) =>
  [
    `Group 311 day: ${formatTimelineDate(day)}.`,
    "Please call 311 or use 311.chicago.gov today. Each resident can make their own request.",
    "Problems in our building:",
    ...items.map((item) => `- ${item.issueLabel} (311 category: ${item.category})`),
    "After you call, add your 311 request number in the building ledger.",
    "Do not share names or unit numbers in this chat.",
  ].join("\n");
