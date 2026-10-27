import type { LineStop } from "./followUp";

/*
 * The building line map: every open problem's steps on one map, with shared step columns, so a
 * resident or steward can see the whole building at once. Each dashboard row draws its own small
 * line; those lines do not line up, so they cannot be compared. A step column with an open step is
 * a link that lists the problems that can take that step now. It shows no counts and no names.
 */

export const lineMapStops = [
  { key: "start", label: "Started" },
  { key: "notice", label: "Notice" },
  { key: "follow-up", label: "Follow-up" },
  { key: "final", label: "Final" },
  { key: "311", label: "311" },
  { key: "fixed", label: "Fixed" },
] as const;

export type LineMapStopKey = (typeof lineMapStops)[number]["key"];

/** More lines than this make the map longer than the list it sums up. The rest stay in the list. */
export const lineMapMaxLines = 8;

/** The map is shown from 2 open problems. With one, it would repeat that problem's row. */
export const lineMapMinLines = 2;

export type LineMapInput = {
  id: string;
  issue: string;
  label: string;
  daysOpen: number;
  line: LineStop[];
};

export type LineMapColumn = {
  key: LineMapStopKey;
  label: string;
  /** At least one problem can take this step now, so the column is a link. */
  hasOpen: boolean;
};

export type LineMapLine = LineMapInput & {
  /** The line in words, for screen readers: "3 of 6 steps done. Open now: Final, 311." */
  summary: string;
};

export type LineMap = {
  columns: LineMapColumn[];
  lines: LineMapLine[];
  /** Open problems left off the map. They are still in the list. */
  more: number;
};

export const isLineMapStopKey = (value: unknown): value is LineMapStopKey =>
  lineMapStops.some((stop) => stop.key === value);

const stopIndex = (key: LineMapStopKey) => lineMapStops.findIndex((stop) => stop.key === key);

/** True when the line's step in this column is open now. City work has a "Ward" step in the 311 column. */
export const isOpenAtStop = (line: LineStop[], key: LineMapStopKey) => line[stopIndex(key)]?.state === "open";

const cityColumnLabel = (rows: LineMapInput[]) => {
  const ward = rows.filter((row) => row.line[stopIndex("311")]?.id === "ward").length;
  return ward === 0 ? "311" : ward === rows.length ? "Ward" : "311 / Ward";
};

export const describeLine = (line: LineStop[]) => {
  const done = line.filter((stop) => stop.state === "done").length;
  const open = line.filter((stop) => stop.state === "open").map((stop) => stop.label);
  return `${done} of ${line.length} steps done.${open.length > 0 ? ` Open now: ${open.join(", ")}.` : ""}`;
};

/** `rows` in the order to draw them: the dashboard lists the oldest open problem first. */
export const buildLineMap = (rows: LineMapInput[], maxLines = lineMapMaxLines): LineMap => ({
  columns: lineMapStops.map((stop) => ({
    key: stop.key,
    label: stop.key === "311" ? cityColumnLabel(rows) : stop.label,
    hasOpen: rows.some((row) => isOpenAtStop(row.line, stop.key)),
  })),
  lines: rows.slice(0, maxLines).map((row) => ({ ...row, summary: describeLine(row.line) })),
  more: Math.max(0, rows.length - maxLines),
});
