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
