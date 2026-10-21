import type { APIRoute } from "astro";
import { guardApiRequest } from "../../../lib/api/requestGuard";
import { jsonError, jsonResponse } from "../../../lib/http";
import { fetchSubmissionRecord, getSubmissionsKv } from "../../../lib/storage/submissions";
import { listRecordEvents } from "../../../lib/storage/recordEvents";
import { nextNoticeStage } from "../../../lib/followUp";
import { formatDate } from "../../../lib/dateUtils";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals, request }) => {
  const id = params.id;
  if (!id) {
    return jsonError("Submission id is required.", 400);
  }

  const kv = getSubmissionsKv(locals.env ?? {});
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }

  const guarded = await guardApiRequest(request, locals, kv, {
    auth: { mode: "resident" },
  });
  if (!guarded.ok) {
    return guarded.response;
  }

  const record = await fetchSubmissionRecord(kv, id);
  if (!record) {
    return jsonError("Submission not found.", 404);
  }

  const allowedBuildings = guarded.context.allowedBuildings;
  const recordBuilding = record.building;
  if (!allowedBuildings.includes("*") && recordBuilding && !allowedBuildings.includes(recordBuilding)) {
    return jsonError("Submission not found.", 404);
  }

  // The notice builder uses `nextNotice` for a follow-up from this record. It is worked out here from
  // the record's dates and on-time notices, so a link cannot ask for a step that is still locked.
  const events = await listRecordEvents(kv, record.id);
  return jsonResponse({ ...record, nextNotice: nextNoticeStage(record, events, formatDate(new Date())) });
};
