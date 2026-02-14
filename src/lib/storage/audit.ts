import { AUDIT_EVENT_TTL_SECONDS, type AuditEvent } from "../audit";

const auditKey = (event: AuditEvent) => `audit:${event.action}:${event.createdAt}:${event.id}`;

export const saveAuditEvent = async (kv: KVNamespace, event: AuditEvent) =>
  kv.put(auditKey(event), JSON.stringify(event), { expirationTtl: AUDIT_EVENT_TTL_SECONDS });
