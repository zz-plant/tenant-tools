import type { IssueOption } from "./types";
import { buildingIssue } from "./issues/building";
import { commonIssue } from "./issues/common";
import { entryIssue } from "./issues/entry";
import { heatIssue } from "./issues/heat";
import { leakIssue } from "./issues/leak";
import { noTimelineIssue } from "./issues/noTimeline";
import { pestsIssue } from "./issues/pests";

export const issueOptions = [
  heatIssue,
  leakIssue,
  pestsIssue,
  entryIssue,
  commonIssue,
  noTimelineIssue,
  buildingIssue,
] as const satisfies IssueOption[];

export type IssueId = (typeof issueOptions)[number]["id"];

/** Short names for tight places such as filter tags. Records and notices keep the full label. */
export const issueShortLabels: Record<string, string> = {
  heat: "Heat",
  leak: "Water leak",
  pests: "Pests",
  entry: "Entry",
  common: "Elevator / common areas",
  "no-timeline": "No repair date",
  building: "Building-wide",
  deposit: "Deposit",
  lockout: "Lockout",
};
