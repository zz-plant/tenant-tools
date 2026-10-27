import { issueOptions } from "../data/notice/issueOptions";
import type { ZoneId } from "../data/notice/guidance";
import { formatResidentReportCount } from "./reportCount";
import type { SubmissionRecord } from "./submissions";

/*
 * Where in the building open problems are, by the optional area on each record. Limits, so the map
 * cannot point to a household (AGENTS.md §2):
 * - No floors and no unit positions. Every "Inside unit" record is counted in one group.
 * - Counts are reports (the first report plus "Me too"). Counts under 3 show as <3.
 * - No area totals, so a total cannot undo a "<3". Problem types keep a fixed order, not most first,
 *   so the order does not tell which "<3" is larger.
 * - Hidden until at least 3 open records list an area.
 * - Resident-only dashboard. Not in the printable summary, the export, or the meeting report.
 */

export type AreaMapZone = Exclude<ZoneId, "unknown">;

export const areaMapZones: { zone: AreaMapZone; letter: string; label: string }[] = [
  { zone: "unit_interior", letter: "A", label: "Inside units, all together" },
  { zone: "hallway", letter: "B", label: "Hallways and stairs" },
  { zone: "entry", letter: "C", label: "Entry or lobby" },
  { zone: "common_area", letter: "D", label: "Common areas" },
];

/** The map is hidden until this many open records list an area. */
export const areaMapMinimumRecords = 3;

export type AreaMapRecord = Pick<SubmissionRecord, "issue" | "zone" | "reportCount" | "status" | "mergedInto">;

export type AreaMapArea = {
  zone: AreaMapZone;
  letter: string;
  label: string;
  items: { issue: string; count: string }[];
};

export type AreaMap = {
  show: boolean;
  areas: AreaMapArea[];
  /** Reports on open records with no area, or "Not sure". */
  notListed: string;
};

const issueOrder = new Map<string, number>(issueOptions.map((option, index) => [option.id, index]));
const reports = (record: AreaMapRecord) => Math.max(1, Math.floor(Number(record.reportCount) || 0));
const isMapZone = (zone: string): zone is AreaMapZone => areaMapZones.some((area) => area.zone === zone);

export const buildAreaMap = (records: AreaMapRecord[]): AreaMap => {
  const open = records.filter((record) => record.status === "open" && !record.mergedInto);
  const listed = open.filter((record) => isMapZone(record.zone));
  const notListed = open.filter((record) => !isMapZone(record.zone)).reduce((sum, record) => sum + reports(record), 0);

  const areas = areaMapZones.map(({ zone, letter, label }) => {
    const byIssue = new Map<string, number>();
    listed
      .filter((record) => record.zone === zone)
      .forEach((record) => byIssue.set(record.issue, (byIssue.get(record.issue) ?? 0) + reports(record)));
    const items = [...byIssue.entries()]
      .sort(([left], [right]) => (issueOrder.get(left) ?? 99) - (issueOrder.get(right) ?? 99) || left.localeCompare(right))
      .map(([issue, count]) => ({ issue, count: formatResidentReportCount(count) }));
    return { zone, letter, label, items };
  });

  return {
    show: listed.length >= areaMapMinimumRecords,
    areas,
    notListed: formatResidentReportCount(notListed),
  };
};
