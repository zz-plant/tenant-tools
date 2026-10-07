import { formatIssueLabel } from "./noticeUtils";
import { formatResidentReportCount } from "./reportCount";

/*
 * Pattern view for the building dashboard: how many records started each month, by issue type.
 * Repeat problems (the same leak logged again, pests in several units) show up as rows with
 * counts in many months. Counts under 3 show as "<3", like the rest of the dashboard.
 */

export type PatternInput = {
  issue: string;
  issueLabel: string;
  startDate: string;
  createdAt: string;
  status: string;
  mergedInto?: string;
};

export type PatternMonth = { key: string; label: string };

export type PatternRow = {
  issue: string;
  issueLabel: string;
  /** Formatted counts, one per month, oldest month first. */
  counts: string[];
  total: string;
  open: string;
  totalCount: number;
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The last `count` calendar months ending with the month of `today` (`YYYY-MM-DD`). */
export const lastMonths = (today: string, count: number): PatternMonth[] => {
  const [year, month] = today.split("-").map(Number);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1 - (count - 1 - index), 1));
    const key = date.toISOString().slice(0, 7);
    return { key, label: `${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}` };
  });
};

const monthOf = (record: PatternInput) => (record.startDate || record.createdAt || "").slice(0, 7);

export const buildIssuePatterns = (records: PatternInput[], today: string, monthCount = 6) => {
  const months = lastMonths(today, monthCount);
  const monthKeys = new Set(months.map((month) => month.key));
  const byIssue = new Map<string, { label: string; perMonth: Map<string, number>; open: number }>();

  records
    .filter((record) => !record.mergedInto && monthKeys.has(monthOf(record)))
    .forEach((record) => {
      const entry = byIssue.get(record.issue) ?? {
        label: formatIssueLabel(record.issueLabel || record.issue),
        perMonth: new Map<string, number>(),
        open: 0,
      };
      const month = monthOf(record);
      entry.perMonth.set(month, (entry.perMonth.get(month) ?? 0) + 1);
      if (record.status === "open") {
        entry.open += 1;
      }
      byIssue.set(record.issue, entry);
    });

  const rows: PatternRow[] = [...byIssue.entries()]
    .map(([issue, entry]) => {
      const totalCount = [...entry.perMonth.values()].reduce((sum, count) => sum + count, 0);
      return {
        issue,
        issueLabel: entry.label,
        counts: months.map((month) => formatResidentReportCount(entry.perMonth.get(month.key) ?? 0)),
        total: formatResidentReportCount(totalCount),
        open: formatResidentReportCount(entry.open),
        totalCount,
      };
    })
    .sort((left, right) => right.totalCount - left.totalCount || left.issueLabel.localeCompare(right.issueLabel));

  return { months, rows };
};
