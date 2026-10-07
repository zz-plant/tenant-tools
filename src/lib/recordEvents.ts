import { getSensitiveContentMessages, isValidDateString, sanitizeLimitedText } from "./validation";

/*
 * Dated facts a resident adds to a saved record after the first notice: management replies,
 * portal requests closed without a repair, offers of entry, city inspections, and changes that
 * came after a repair request. Each fact is a type from a fixed list, a date, and for two types
 * a short reference number. There is no free text.
 */

export const recordEventTypes = [
  "reply_due",
  "management_replied",
  "repair_date_promised",
  "repair_visit_missed",
  "portal_marked_complete",
  "entry_offered",
  "inspection_done",
  "rent_increase_notice",
  "nonrenewal_notice",
  "service_reduced",
  "eviction_notice",
] as const;

export type RecordEventType = (typeof recordEventTypes)[number];

export type RecordEventGroup = "follow_up" | "access" | "city" | "after_request";

type RecordEventDefinition = {
  label: string;
  group: RecordEventGroup;
  /** Label for the date field. */
  dateLabel: string;
  /** Deadlines and promised dates can be in the future. Other facts cannot. */
  allowsFuture?: boolean;
  /** Present when the fact takes a short reference number. */
  refLabel?: string;
  /** Word shown before the reference in the timeline, for example "work order 12345". */
  refPrefix?: string;
};

export const recordEventDefinitions: Record<RecordEventType, RecordEventDefinition> = {
  reply_due: {
    label: "Reply requested by",
    group: "follow_up",
    dateLabel: "Date the reply is due",
    allowsFuture: true,
  },
  management_replied: { label: "Management replied", group: "follow_up", dateLabel: "Date of the reply" },
  repair_date_promised: {
    label: "Repair date promised",
    group: "follow_up",
    dateLabel: "Promised repair date",
    allowsFuture: true,
  },
  repair_visit_missed: {
    label: "Repair visit was scheduled, but no one came",
    group: "follow_up",
    dateLabel: "Date of the missed visit",
  },
  portal_marked_complete: {
    label: "Portal request marked complete, but not fixed",
    group: "follow_up",
    dateLabel: "Date it was marked complete",
    refLabel: "Work order number (optional)",
    refPrefix: "work order",
  },
  entry_offered: {
    label: "Resident offered entry for repair or treatment",
    group: "access",
    dateLabel: "Date entry was offered",
  },
  inspection_done: {
    label: "City inspection happened",
    group: "city",
    dateLabel: "Date of the inspection",
    refLabel: "Inspection or 311 number (optional)",
    refPrefix: "number",
  },
  rent_increase_notice: {
    label: "Rent increase notice received",
    group: "after_request",
    dateLabel: "Date the notice arrived",
  },
  nonrenewal_notice: {
    label: "Lease non-renewal notice received",
    group: "after_request",
    dateLabel: "Date the notice arrived",
  },
  service_reduced: {
    label: "A building service was reduced or removed",
    group: "after_request",
    dateLabel: "Date it started",
  },
  eviction_notice: {
    label: "Eviction or lease termination notice received",
    group: "after_request",
    dateLabel: "Date the notice arrived",
  },
};

export const recordEventGroups: Array<{ id: RecordEventGroup; label: string }> = [
  { id: "follow_up", label: "Management follow-up" },
  { id: "access", label: "Entry for repairs" },
  { id: "city", label: "City" },
  { id: "after_request", label: "Changes after a repair request" },
];

/** Fact types that are not shown in summaries meant for management. */
export const afterRequestEventTypes = recordEventTypes.filter(
  (type) => recordEventDefinitions[type].group === "after_request"
);

export type RecordEvent = {
  id: string;
  type: RecordEventType;
  date: string;
  ref?: string;
};

export type RecordEventInput = Omit<RecordEvent, "id">;

export const maxRecordEvents = 30;
export const recordEventRefLimit = 40;
/** Deadlines and promised dates more than a year ahead are almost always typing mistakes. */
const maxFutureDays = 366;

export const isRecordEventType = (value: unknown): value is RecordEventType =>
  typeof value === "string" && (recordEventTypes as readonly string[]).includes(value);

const addDaysIso = (isoDate: string, days: number) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
};

/**
 * Checks a new fact. `today` is the server date (`YYYY-MM-DD`). One extra day is allowed for
 * residents whose local date is ahead of the server.
 */
export const validateRecordEventInput = (
  payload: unknown,
  today: string
): { ok: true; data: RecordEventInput } | { ok: false; errors: string[] } => {
  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["Payload must be an object."] };
  }
  const data = payload as Record<string, unknown>;
  const errors: string[] = [];

  if (!isRecordEventType(data.type)) {
    return { ok: false, errors: ["Choose what happened from the list."] };
  }
  const definition = recordEventDefinitions[data.type];

  const date = typeof data.date === "string" ? data.date : "";
  if (!isValidDateString(date)) {
    errors.push("Date is invalid.");
  } else if (!definition.allowsFuture && date > addDaysIso(today, 1)) {
    errors.push("This date cannot be in the future.");
  } else if (date > addDaysIso(today, maxFutureDays)) {
    errors.push("This date is too far in the future.");
  } else if (date < "2000-01-01") {
    errors.push("Date is invalid.");
  }

  let ref: string | undefined;
  if (definition.refLabel && typeof data.ref === "string") {
    ref = sanitizeLimitedText(data.ref, recordEventRefLimit) || undefined;
    if (ref) {
      // Work order and 311 numbers can be 10 digits, so only formatted phone numbers are rejected.
      getSensitiveContentMessages(ref, { allowBareDigitRuns: true }).forEach((message) =>
        errors.push(`Number: ${message}`)
      );
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, data: { type: data.type, date, ...(ref ? { ref } : {}) } };
};

export const createRecordEvent = (input: RecordEventInput): RecordEvent => ({
  id: crypto.randomUUID().replace(/-/g, "").slice(0, 16),
  ...input,
});

/** Reads a stored fact defensively. Returns null for anything that is not a valid fact. */
export const parseRecordEvent = (id: string, value: unknown): RecordEvent | null => {
  if (!value || typeof value !== "object") {
    return null;
  }
  const raw = value as Record<string, unknown>;
  if (!isRecordEventType(raw.type) || typeof raw.date !== "string" || !isValidDateString(raw.date)) {
    return null;
  }
  const ref = typeof raw.ref === "string" && raw.ref ? raw.ref.slice(0, recordEventRefLimit) : undefined;
  return { id, type: raw.type, date: raw.date, ...(ref ? { ref } : {}) };
};

/** "Portal request marked complete, but not fixed (work order 12345)" */
export const formatRecordEventLabel = (event: Pick<RecordEvent, "type" | "ref">) => {
  const definition = recordEventDefinitions[event.type];
  return event.ref && definition.refPrefix
    ? `${definition.label} (${definition.refPrefix} ${event.ref})`
    : definition.label;
};

/** Facts in date order, oldest first. */
export const sortRecordEvents = (events: RecordEvent[]) =>
  [...events].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

/** Short names for the follow-up facts counted in the printable building summary. */
const followUpSummaryLabels: Partial<Record<RecordEventType, string>> = {
  portal_marked_complete: "Marked complete, not fixed",
  repair_visit_missed: "Missed repair visits",
  entry_offered: "Entry offered",
  management_replied: "Management replies",
  inspection_done: "City inspections",
};

/**
 * "Marked complete, not fixed: 2; Entry offered: 1" for one record.
 * Changes after a repair request are left out: this summary can go to an inspector.
 */
export const summarizeFollowUpFacts = (events: RecordEvent[]) => {
  const counts = new Map<RecordEventType, number>();
  events.forEach((event) => {
    if (followUpSummaryLabels[event.type]) {
      counts.set(event.type, (counts.get(event.type) ?? 0) + 1);
    }
  });
  return recordEventTypes
    .filter((type) => counts.has(type))
    .map((type) => `${followUpSummaryLabels[type]}: ${counts.get(type)}`)
    .join("; ");
};

