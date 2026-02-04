import type { APIRoute } from "astro";
import { issueOptions } from "../../../data/noticeData";
import { enforceRateLimit, getClientIp } from "../../../lib/rateLimit";
import { validateSubmissionInput } from "../../../lib/submissions";
import { isBuildingAccessValid, isResidentKeyRecognized } from "../../../lib/access";
import { getRequestKey, jsonError, jsonResponse, parseJsonBody } from "../../../lib/http";
import { getSubmissionsKv, saveSubmissionRecord } from "../../../lib/storage/submissions";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const payload = await parseJsonBody(request, null);
  const validation = validateSubmissionInput(payload);

  if (!validation.ok) {
    return jsonError("We could not save this submission.", 400, { details: validation.errors });
  }

  const env = locals.runtime?.env ?? {};
  const providedKey = getRequestKey(request, "x-building-key", "key");
  if (!isResidentKeyRecognized(providedKey, env)) {
    return jsonError("Resident access is required.", 403);
  }
  if (!isBuildingAccessValid(validation.data.building, providedKey, env)) {
    return jsonError("This key does not match the building.", 403);
  }

  const issueLabel = issueOptions.find((issue) => issue.id === validation.data.issue)?.label ?? validation.data.issue;
  const record = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "open",
    issueLabel,
    ...validation.data,
  };

  const kv = getSubmissionsKv(env);
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }

  const ip = getClientIp(request);
  const rateLimit = await enforceRateLimit({
    kv,
    key: `rate:submission:${ip}`,
    limit: 6,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return jsonError("Too many submissions. Try again soon.", 429, {}, { "Retry-After": String(rateLimit.retryAfter) });
  }

  await saveSubmissionRecord(kv, record);

  const keyForUrl = typeof providedKey === "string" ? providedKey.trim() : "";
  const keyParam = keyForUrl ? `?key=${encodeURIComponent(keyForUrl)}` : "";
  return jsonResponse({ id: record.id, url: `/submissions/${record.id}${keyParam}` }, 201);
};
