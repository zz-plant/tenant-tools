import { issueOptions } from "../data/noticeData";
import { formatTimelineDate } from "./dateUtils";
import { formatIssueLabel } from "./noticeUtils";
import { formatResidentReportCount } from "./reportCount";
import { isValidDateString } from "./validation";

/*
 * Canvass tally: during door-knocking, an organizer counts how many households have each problem.
 * Counts only. No unit numbers, no names. Saved by a steward and kept apart from "me too" counts,
 * so neither one can inflate the other.
 */

/** Problems an organizer can count at the door. */
export const canvassIssueIds = ["heat", "leak", "pests", "entry", "common"] as const;
export type CanvassIssueId = (typeof canvassIssueIds)[number];

export const canvassIssueLabels: Record<CanvassIssueId, string> = Object.fromEntries(
  canvassIssueIds.map((id) => [id, formatIssueLabel(issueOptions.find((option) => option.id === id)?.label ?? id)])
) as Record<CanvassIssueId, string>;

export type Canvass = {
  id: string;
  date: string;
  householdsReached: number;
  tallies: Partial<Record<CanvassIssueId, number>>;
};

export type CanvassInput = Omit<Canvass, "id">;

const maxCount = 999;

const readCount = (value: unknown) =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= maxCount ? value : null;

const addDaysIso = (isoDate: string, days: number) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
};

export const validateCanvassInput = (
  payload: unknown,
  today: string
): { ok: true; data: CanvassInput } | { ok: false; message: string } => {
  if (!payload || typeof payload !== "object") {
    return { ok: false, message: "Payload must be an object." };
  }
  const data = payload as Record<string, unknown>;
  const date = typeof data.date === "string" ? data.date : "";
  if (!isValidDateString(date) || date > addDaysIso(today, 1) || date < "2000-01-01") {
    return { ok: false, message: "Canvass date is invalid." };
  }
  const householdsReached = readCount(data.householdsReached);
  if (householdsReached === null) {
    return { ok: false, message: "Households reached must be a whole number from 0 to 999." };
  }
  const rawTallies = data.tallies && typeof data.tallies === "object" ? (data.tallies as Record<string, unknown>) : {};
  const tallies: Partial<Record<CanvassIssueId, number>> = {};
  for (const [issue, value] of Object.entries(rawTallies)) {
    if (!(canvassIssueIds as readonly string[]).includes(issue)) {
      return { ok: false, message: "A problem type is not on the list." };
    }
    const count = readCount(value);
    if (count === null) {
      return { ok: false, message: "Counts must be whole numbers from 0 to 999." };
    }
    if (householdsReached > 0 && count > householdsReached) {
      return { ok: false, message: "A count is larger than the number of households reached." };
    }
    if (count > 0) {
      tallies[issue as CanvassIssueId] = count;
    }
  }
  if (Object.keys(tallies).length === 0) {
    return { ok: false, message: "Count at least one household with a problem." };
  }
  return { ok: true, data: { date, householdsReached, tallies } };
};

export const parseCanvass = (id: string, value: unknown): Canvass | null => {
  if (!value || typeof value !== "object") {
    return null;
  }
  const validated = validateCanvassInput(value, "9999-12-30");
  return validated.ok ? { id, ...validated.data } : null;
};

/** "Pests: 9. Heat: 4. Water leak: <3." Counts under 3 are bucketed. */
export const describeCanvassTallies = (canvass: Canvass) =>
  canvassIssueIds
    .filter((id) => canvass.tallies[id])
    .sort((a, b) => (canvass.tallies[b] ?? 0) - (canvass.tallies[a] ?? 0))
    .map((id) => `${canvassIssueLabels[id]}: ${formatResidentReportCount(canvass.tallies[id] ?? 0)}`)
    .join(". ");

export const describeCanvass = (canvass: Canvass) =>
  `${formatTimelineDate(canvass.date)}: ${formatResidentReportCount(canvass.householdsReached)} households reached. ${describeCanvassTallies(canvass)}.`;

/** Latest canvass count for one problem type, when there is one. */
export const latestCanvassCount = (canvasses: Canvass[], issue: string) => {
  const latest = canvasses.find((canvass) => canvass.tallies[issue as CanvassIssueId]);
  return latest ? { date: latest.date, count: latest.tallies[issue as CanvassIssueId] ?? 0 } : null;
};
