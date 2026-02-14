export const AUDIT_EVENT_TTL_SECONDS = 60 * 60 * 24 * 90;

export type AuditEventAction =
  | "submission.create"
  | "submission.status.update"
  | "submission.report.increment"
  | "waitlist.create";

export type AuditEventOutcome = "success" | "rejected";

export type AuditEvent = {
  id: string;
  action: AuditEventAction;
  outcome: AuditEventOutcome;
  createdAt: string;
  resourceId?: string;
  scope?: "resident" | "steward" | "public";
};

export const createAuditEvent = (event: Omit<AuditEvent, "id" | "createdAt">): AuditEvent => ({
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  ...event,
});
