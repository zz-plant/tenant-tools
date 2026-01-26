import type { IssueId } from "./issueOptions";

export const zoneOptions = [
  { id: "common_area", label: "Common area" },
  { id: "hallway", label: "Hallway or stairwell" },
  { id: "unit_interior", label: "Inside unit" },
  { id: "entry", label: "Entry or lobby" },
  { id: "unknown", label: "Not sure" },
] as const;

export type ZoneId = (typeof zoneOptions)[number]["id"];

type Issue311GuidanceId = Extract<IssueId, "heat" | "leak" | "pests" | "entry" | "common">;

export const issue311Guidance: Record<
  Issue311GuidanceId,
  {
    category: string;
    script: string;
    nextStep: string;
  }
> = {
  heat: {
    category: "No heat",
    script: "The heat has not been warm enough since [START DATE].",
    nextStep:
      "Common paths tenants encounter include an inspection request. A risk is unclear timing and documentation gaps if dates or photos are missing.",
  },
  leak: {
    category: "Water leak",
    script: "There is ongoing water leaking at [LOCATION] since [START DATE].",
    nextStep:
      "Common paths tenants encounter include an inspection request. A risk is unclear timing and documentation gaps if dates or photos are missing.",
  },
  pests: {
    category: "Pest issue",
    script: "I have seen pests since [START DATE] and the problem is still happening.",
    nextStep:
      "Common paths tenants encounter include an inspection request. A risk is unclear timing and documentation gaps if dates or photos are missing.",
  },
  entry: {
    category: "Entry without notice",
    script: "Someone entered without notice on [DATE].",
    nextStep:
      "Common paths tenants encounter include a city follow-up. A risk is a documentation gap if dates or prior notices are missing.",
  },
  common: {
    category: "Common area problem",
    script: "There is a common area problem since [START DATE].",
    nextStep:
      "Common paths tenants encounter include an inspection request. A risk is unclear timing and documentation gaps if dates or photos are missing.",
  },
};
