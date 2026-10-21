import type { IssueOption } from "./types";
import { accessIssue } from "./issues/access";
import { buildingIssue } from "./issues/building";
import { cityWorkIssue } from "./issues/cityWork";
import { commonIssue } from "./issues/common";
import { damageIssue } from "./issues/damage";
import { entryIssue } from "./issues/entry";
import { heatIssue } from "./issues/heat";
import { leakIssue } from "./issues/leak";
import { noTimelineIssue } from "./issues/noTimeline";
import { parkingIssue } from "./issues/parking";
import { pestsIssue } from "./issues/pests";
import { trashIssue } from "./issues/trash";

export const issueOptions = [
  heatIssue,
  leakIssue,
  pestsIssue,
  entryIssue,
  commonIssue,
  accessIssue,
  trashIssue,
  parkingIssue,
  cityWorkIssue,
  damageIssue,
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
  access: "Doors / fobs",
  trash: "Trash",
  parking: "Parking",
  "city-work": "City work",
  damage: "Damage",
  "no-timeline": "No repair date",
  building: "Building-wide",
  deposit: "Deposit",
  lockout: "Lockout",
};
