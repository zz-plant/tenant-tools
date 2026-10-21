import { getSensitiveContentMessages, isValidDateString, sanitizeLimitedText } from "./validation";

/*
 * "Who to send notices to" for one building: the owner, the property manager, the rent or repair
 * portal, and the address for written notices. Business names only. A steward saves it, and
 * residents with the building key can read it. Email addresses and phone numbers are rejected,
 * so a staff member's own contact details cannot end up here.
 */

export const noticeContactFields = [
  { key: "owner", label: "Owner (business name)", placeholder: "Example: 2400 Building LLC" },
  { key: "manager", label: "Property manager (business name)", placeholder: "Example: Main Street Property Management" },
  { key: "portal", label: "Rent or repair portal", placeholder: "Example: the portal's name" },
  { key: "noticeAddress", label: "Address for written notices", placeholder: "Example: 100 N Main St, Suite 400, Chicago, IL" },
] as const;

export type NoticeContactField = (typeof noticeContactFields)[number]["key"];

export const noticeContactSources = {
  lease: "The lease",
  disclosure: "Owner and manager notice from the landlord",
  management_notice: "A notice or email from management",
  county_records: "Cook County property records",
  other: "Other",
} as const;

export type NoticeContactSource = keyof typeof noticeContactSources;

export type NoticeContacts = Partial<Record<NoticeContactField, string>> & {
  source?: NoticeContactSource;
  /** `YYYY-MM-DD` the steward last saved it. */
  updatedAt: string;
};

export const noticeContactLimit = 100;

const isSource = (value: unknown): value is NoticeContactSource =>
  typeof value === "string" && Object.hasOwn(noticeContactSources, value);

/** Checks a steward's save. `today` is the server date. */
export const validateNoticeContactsInput = (
  payload: unknown,
  today: string
): { ok: true; data: NoticeContacts } | { ok: false; message: string } => {
  if (!payload || typeof payload !== "object") {
    return { ok: false, message: "Payload must be an object." };
  }
  const raw = payload as Record<string, unknown>;
  const data: NoticeContacts = { updatedAt: today };
  for (const field of noticeContactFields) {
    const value = typeof raw[field.key] === "string" ? sanitizeLimitedText(raw[field.key] as string, noticeContactLimit) : "";
    if (!value) {
      continue;
    }
    // Suites are part of business addresses, so only email addresses and phone numbers are rejected.
    const problems = getSensitiveContentMessages(value).filter((message) => message !== "Remove unit numbers.");
    if (problems.length > 0) {
      return { ok: false, message: `${field.label}: ${problems.join(" ")} Business names and mailing addresses only.` };
    }
    data[field.key] = value;
  }
  if (!noticeContactFields.some((field) => data[field.key])) {
    return { ok: false, message: "Fill in at least one line." };
  }
  if (raw.source !== undefined && raw.source !== "") {
    if (!isSource(raw.source)) {
      return { ok: false, message: "Choose where this came from from the list." };
    }
    data.source = raw.source;
  }
  return { ok: true, data };
};

/** Reads a stored value defensively. Returns null for anything that is not a saved card. */
export const parseNoticeContacts = (value: unknown): NoticeContacts | null => {
  if (!value || typeof value !== "object") {
    return null;
  }
  const raw = value as Record<string, unknown>;
  if (typeof raw.updatedAt !== "string" || !isValidDateString(raw.updatedAt)) {
    return null;
  }
  const contacts: NoticeContacts = { updatedAt: raw.updatedAt };
  for (const field of noticeContactFields) {
    const entry = raw[field.key];
    if (typeof entry === "string" && entry) {
      contacts[field.key] = entry.slice(0, noticeContactLimit);
    }
  }
  if (isSource(raw.source)) {
    contacts.source = raw.source;
  }
  return noticeContactFields.some((field) => contacts[field.key]) ? contacts : null;
};

/** Filled lines in display order, for the dashboard card and the letter page. */
export const listNoticeContactLines = (contacts: NoticeContacts) =>
  noticeContactFields
    .filter((field) => contacts[field.key])
    .map((field) => ({ label: field.label.replace(/ \(business name\)$/, ""), value: contacts[field.key] as string }));
