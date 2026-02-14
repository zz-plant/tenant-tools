import type { APIRoute } from "astro";
import { guardApiRequest } from "../../../lib/api/requestGuard";
import { jsonError, jsonResponse } from "../../../lib/http";
import type { SubmissionRecord } from "../../../lib/submissions";
import { fetchSubmissionRecord, getSubmissionsKv } from "../../../lib/storage/submissions";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals, request }) => {
  const id = params.id;
  if (!id) {
    return jsonError("Submission id is required.", 400);
  }

  const kv = getSubmissionsKv(locals.runtime?.env ?? {});
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }

  const guarded = await guardApiRequest(request, locals, kv, {
    auth: { mode: "resident" },
  });
  if (!guarded.ok) {
    return guarded.response;
  }

  const record = await fetchSubmissionRecord<SubmissionRecord>(kv, id);
  if (!record) {
    return jsonError("Submission not found.", 404);
  }

  const allowedBuildings = guarded.context.allowedBuildings;
  const recordBuilding = record.building;
  if (!allowedBuildings.includes("*") && recordBuilding && !allowedBuildings.includes(recordBuilding)) {
    return jsonError("Submission not found.", 404);
  }

  return jsonResponse(record);
};
