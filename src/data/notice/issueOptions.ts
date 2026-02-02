import type { IssueOption } from "./types";
import { buildingIssue } from "./issues/building";
import { commonIssue } from "./issues/common";
import { depositIssue } from "./issues/deposit";
import { entryIssue } from "./issues/entry";
import { heatIssue } from "./issues/heat";
import { leakIssue } from "./issues/leak";
import { lockoutIssue } from "./issues/lockout";
import { noTimelineIssue } from "./issues/noTimeline";
import { pestsIssue } from "./issues/pests";

export const issueOptions = [
  heatIssue,
  leakIssue,
  pestsIssue,
  entryIssue,
  commonIssue,
  noTimelineIssue,
  depositIssue,
  lockoutIssue,
  buildingIssue,
] as const satisfies IssueOption[];

export type IssueId = (typeof issueOptions)[number]["id"];
