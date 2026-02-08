import type { APIRoute } from "astro";
import { isAccessKeyValid } from "../../../../lib/access";
import { enforceRateLimit, getClientIp } from "../../../../lib/rateLimit";
import { isSubmissionRecord, isValidSubmissionStatus, type SubmissionRecord } from "../../../../lib/submissions";
import { getRequestKey, jsonError, jsonResponse, parseJsonBody } from "../../../../lib/http";
import { fetchSubmissionRecord, getSubmissionsKv, saveSubmissionRecord } from "../../../../lib/storage/submissions";

export const prerender = false;

export const POST: APIRoute = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return jsonError("Submission id is required.", 400);
  }

  const requiredKey = locals.runtime?.env?.STEWARD_KEY;
  const providedKey = getRequestKey(request, "x-steward-key", "stewardKey");
  if (!isAccessKeyValid(providedKey, requiredKey)) {
    return jsonError("Steward access is required.", 403);
  }

  const payload = await parseJsonBody(request, {});
  const status = payload?.status;
  if (!isValidSubmissionStatus(status)) {
    return jsonError("Status is invalid.", 400);
  }

  const kv = getSubmissionsKv(locals.runtime?.env ?? {});
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }

  const ip = getClientIp(request);
  const rateLimit = await enforceRateLimit({
    kv,
    key: `rate:status:${ip}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return jsonError(
      "Too many status updates. Try again soon.",
      429,
      {},
      { "Retry-After": String(rateLimit.retryAfter) }
    );
  }

  const record = await fetchSubmissionRecord<SubmissionRecord>(kv, id);
  if (!isSubmissionRecord(record)) {
    return jsonError("Submission not found.", 404);
  }

  const updated: SubmissionRecord = { ...record, status };
  await saveSubmissionRecord(kv, updated);

  return jsonResponse({ status });
};
