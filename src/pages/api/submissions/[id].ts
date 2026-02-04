import type { APIRoute } from "astro";
import { getBuildingIdsForKey, isResidentKeyRecognized } from "../../../lib/access";
import { getRequestKey, jsonError, jsonResponse } from "../../../lib/http";
import { fetchSubmissionRecord, getSubmissionsKv } from "../../../lib/storage/submissions";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals, request }) => {
  const id = params.id;
  if (!id) {
    return jsonError("Submission id is required.", 400);
  }

  const env = locals.runtime?.env ?? {};
  const providedKey = getRequestKey(request, "x-building-key", "key");
  if (!isResidentKeyRecognized(providedKey, env)) {
    return jsonError("Resident access is required.", 403);
  }

  const kv = getSubmissionsKv(env);
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }

  const record = await fetchSubmissionRecord(kv, id);
  if (!record) {
    return jsonError("Submission not found.", 404);
  }

  const allowedBuildings = getBuildingIdsForKey(providedKey, env);
  const recordBuilding = typeof record === "object" && record ? String((record as Record<string, unknown>).building || "") : "";
  if (!allowedBuildings.includes("*") && recordBuilding && !allowedBuildings.includes(recordBuilding)) {
    return jsonError("Submission not found.", 404);
  }

  return jsonResponse(record);
};
