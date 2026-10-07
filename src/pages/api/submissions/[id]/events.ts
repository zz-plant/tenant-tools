import type { APIRoute } from "astro";
import { guardApiRequest } from "../../../../lib/api/requestGuard";
import { formatDate } from "../../../../lib/dateUtils";
import { jsonError, jsonResponse } from "../../../../lib/http";
import {
  createRecordEvent,
  maxRecordEvents,
  validateRecordEventInput,
  type RecordEventInput,
} from "../../../../lib/recordEvents";
import {
  deleteRecordEvent,
  isRecordEventId,
  listRecordEvents,
  saveRecordEvent,
} from "../../../../lib/storage/recordEvents";
import { fetchSubmissionRecord, getSubmissionsKv } from "../../../../lib/storage/submissions";

export const prerender = false;

/** Residents add a dated fact to a record. */
export const POST: APIRoute = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return jsonError("Submission id is required.", 400);
  }

  const kv = getSubmissionsKv(locals.runtime?.env ?? {});
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }

  const guarded = await guardApiRequest<unknown, RecordEventInput>(request, locals, kv, {
    auth: { mode: "resident" },
    parseBody: { fallback: null as unknown },
    validate: (payload) => {
      const validation = validateRecordEventInput(payload, formatDate(new Date()));
      if (!validation.ok) {
        return { ok: false, message: validation.errors[0] ?? "We could not save this fact.", details: { details: validation.errors } };
      }
      return { ok: true, data: validation.data };
    },
    rateLimit: () => ({
      kv,
      keyPrefix: "rate:event",
      limit: 8,
      windowMs: 60_000,
      message: "Too many updates. Try again soon.",
    }),
    audit: {
      kv,
      action: "submission.event.add",
      scope: "resident",
      resourceIdFromContext: () => id,
      logRejected: true,
    },
  });

  if (!guarded.ok) {
    return guarded.response;
  }
  const payload = guarded.context.payload;
  if (!payload) {
    return jsonError("Request body is invalid.", 400);
  }

  const record = await fetchSubmissionRecord(kv, id);
  const allowedBuildings = guarded.context.allowedBuildings;
  if (!record || (!allowedBuildings.includes("*") && record.building && !allowedBuildings.includes(record.building))) {
    return jsonError("Submission not found.", 404);
  }
  if (record.mergedInto) {
    return jsonError("This record was merged. Add facts to the main record.", 409, { mergedInto: record.mergedInto });
  }

  const existing = await listRecordEvents(kv, id);
  if (existing.length >= maxRecordEvents) {
    return jsonError(`A record can have up to ${maxRecordEvents} dated facts.`, 409);
  }

  const event = createRecordEvent(payload);
  await saveRecordEvent(kv, id, event);
  await guarded.context.logAuditSuccess(id);

  return jsonResponse({ event, events: [...existing, event] }, 201);
};

/** Stewards remove a fact added by mistake. Housekeeping only: facts are never edited. */
export const DELETE: APIRoute = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return jsonError("Submission id is required.", 400);
  }

  const kv = getSubmissionsKv(locals.runtime?.env ?? {});
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }

  const guarded = await guardApiRequest(request, locals, kv, {
    auth: { mode: "steward" },
    parseBody: { fallback: {} as { eventId?: unknown } },
    validate: (payload) =>
      isRecordEventId(payload?.eventId)
        ? { ok: true, data: { eventId: payload.eventId } }
        : { ok: false, message: "Fact id is invalid." },
    rateLimit: () => ({
      kv,
      keyPrefix: "rate:event-remove",
      limit: 10,
      windowMs: 60_000,
      message: "Too many updates. Try again soon.",
    }),
    audit: {
      kv,
      action: "submission.event.remove",
      scope: "steward",
      resourceIdFromContext: () => id,
      logRejected: true,
    },
  });

  if (!guarded.ok) {
    return guarded.response;
  }
  const eventId = guarded.context.payload?.eventId;
  if (!eventId) {
    return jsonError("Request body is invalid.", 400);
  }

  const record = await fetchSubmissionRecord(kv, id);
  if (!record) {
    return jsonError("Submission not found.", 404);
  }

  const existing = await listRecordEvents(kv, id);
  if (!existing.some((event) => event.id === eventId)) {
    return jsonError("Fact not found.", 404);
  }

  await deleteRecordEvent(kv, id, eventId);
  await guarded.context.logAuditSuccess(id);

  return jsonResponse({ removed: eventId, events: existing.filter((event) => event.id !== eventId) });
};
