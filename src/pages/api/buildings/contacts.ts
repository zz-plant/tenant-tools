import type { APIRoute } from "astro";
import { guardApiRequest } from "../../../lib/api/requestGuard";
import { formatDate } from "../../../lib/dateUtils";
import { jsonError, jsonResponse } from "../../../lib/http";
import { validateNoticeContactsInput, type NoticeContacts } from "../../../lib/noticeContacts";
import { deleteNoticeContacts, saveNoticeContacts } from "../../../lib/storage/noticeContacts";
import { getSubmissionsKv, hashBuildingId } from "../../../lib/storage/submissions";
import { validateBuildingId } from "../../../lib/validation";

export const prerender = false;

const rateLimit = (kv: KVNamespace) => () => ({
  kv,
  keyPrefix: "rate:contacts",
  limit: 10,
  windowMs: 60_000,
  message: "Too many saves. Try again soon.",
});

/** Stewards save who to send notices to for a building. Business names only. */
export const POST: APIRoute = async ({ request, locals }) => {
  const kv = getSubmissionsKv(locals.env ?? {});
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }
  const guarded = await guardApiRequest<Record<string, unknown>, { building: string; contacts: NoticeContacts }>(
    request,
    locals,
    kv,
    {
      auth: { mode: "steward" },
      parseBody: { fallback: {} },
      validate: (payload) => {
        const building = validateBuildingId(payload?.building);
        if (!building.ok) {
          return { ok: false, message: building.message };
        }
        const contacts = validateNoticeContactsInput(payload, formatDate(new Date()));
        if (!contacts.ok) {
          return { ok: false, message: contacts.message };
        }
        return { ok: true, data: { building: building.building, contacts: contacts.data } };
      },
      rateLimit: rateLimit(kv),
      audit: { kv, action: "building.contacts.save", scope: "steward", logRejected: true },
    }
  );
  if (!guarded.ok) {
    return guarded.response;
  }
  const payload = guarded.context.payload;
  if (!payload) {
    return jsonError("Request body is invalid.", 400);
  }
  await saveNoticeContacts(kv, payload.building, payload.contacts);
  await guarded.context.logAuditSuccess(await hashBuildingId(payload.building));
  return jsonResponse({ contacts: payload.contacts }, 201);
};

/** Stewards clear the card, for example when the building changes hands. */
export const DELETE: APIRoute = async ({ request, locals }) => {
  const kv = getSubmissionsKv(locals.env ?? {});
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }
  const guarded = await guardApiRequest<Record<string, unknown>, { building: string }>(request, locals, kv, {
    auth: { mode: "steward" },
    parseBody: { fallback: {} },
    validate: (payload) => {
      const building = validateBuildingId(payload?.building);
      return building.ok ? { ok: true, data: { building: building.building } } : { ok: false, message: building.message };
    },
    rateLimit: rateLimit(kv),
    audit: { kv, action: "building.contacts.save", scope: "steward", logRejected: true },
  });
  if (!guarded.ok) {
    return guarded.response;
  }
  const payload = guarded.context.payload;
  if (!payload) {
    return jsonError("Request body is invalid.", 400);
  }
  await deleteNoticeContacts(kv, payload.building);
  await guarded.context.logAuditSuccess(await hashBuildingId(payload.building));
  return jsonResponse({ removed: true });
};
