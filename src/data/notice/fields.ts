import type { IssueId } from "./issueOptions";

export const fieldDefinitions = {
  temp: { label: "Temperature (°F)", type: "number", placeholder: "68" },
  time: { label: "Time", type: "time" },
  location: { label: "Location (for leaks)", placeholder: "kitchen ceiling" },
  attachment: { label: "Evidence note (optional)", placeholder: "photo of ceiling leak" },
  eventDate: { label: "Event date", type: "date" },
  eventDates: { label: "Event date(s)", placeholder: "[DATES]" },
  eventDateTime: { label: "Event date/time", placeholder: "[DATE/TIME]" },
  moveOutDate: { label: "Move-out date", type: "date" },
  pestType: { label: "Pest type (roaches/rats/bedbugs)", placeholder: "ROACHES" },
  commonArea: { label: "Common area item", placeholder: "ELEVATOR" },
  lockoutAction: { label: "Lockout or shutoff action", placeholder: "LOCK ME OUT" },
  issueDescription: { label: "Issue description (building-wide)", placeholder: "broken elevator" },
} as const;

export type FieldDefinitionKey = keyof typeof fieldDefinitions;

type IssueFieldMap = Record<IssueId, FieldDefinitionKey[]>;

export const issueFieldMap = {
  heat: ["temp", "time"],
  leak: ["location", "attachment"],
  pests: ["pestType", "attachment"],
  entry: ["eventDate", "eventDates", "attachment"],
  common: ["commonArea", "attachment"],
  "no-timeline": [],
  deposit: ["moveOutDate"],
  lockout: ["lockoutAction", "eventDate", "eventDateTime", "attachment"],
  building: ["issueDescription", "attachment"],
} satisfies IssueFieldMap;

export const stages = {
  A: "Initial notice",
  B: "Follow-up",
  C: "Final notice",
};

export const meaningMap = {
  A: ["States the problem", "Creates a clear written record", "Asks for a repair date"],
  B: ["Repeats the request", "Shows the issue is ongoing", "Asks for a specific date"],
  C: ["Sets urgency", "States the timeline", "Signals a next step if unresolved"],
};
