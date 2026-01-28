import type { APIRoute } from "astro";
import { createReportEntry, REPORT_ENTRY_TTL_SECONDS } from "../../../../lib/reports";
import { enforceRateLimit, getClientIp } from "../../../../lib/rateLimit";
import { getBuildingIdsForKey, isResidentKeyRecognized } from "../../../../lib/access";
import { getRequestKey, jsonError, jsonResponse, parseJsonBody } from "../../../../lib/http";

export const prerender = false;

export const POST: APIRoute = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return jsonError("Submission id is required.", 400);
  }

  const payload = await parseJsonBody(request, {});
  const increment = typeof payload?.increment === "number" ? payload.increment : 1;
  if (!Number.isFinite(increment) || increment < 1 || increment > 5) {
    return jsonError("Invalid increment.", 400);
  }

  const env = locals.runtime?.env ?? {};
  const providedKey = getRequestKey(request, "x-building-key", "key");
  if (!isResidentKeyRecognized(providedKey, env)) {
    return jsonError("Resident access is required.", 403);
  }

  const kv = locals.runtime?.env?.SUBMISSIONS_KV;
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }

  const ip = getClientIp(request);
  const rateLimit = await enforceRateLimit({
    kv,
    key: `rate:report:${ip}`,
    limit: 4,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return jsonError(
      "Too many report updates. Try again soon.",
      429,
      {},
      { "Retry-After": String(rateLimit.retryAfter) }
    );
  }

  const record = (await kv.get(`submission:${id}`, { type: "json" })) as
    | {
        id: string;
        building: string;
        reportCount: number;
      }
    | null;

  if (!record) {
    return jsonError("Submission not found.", 404);
  }

  const allowedBuildings = getBuildingIdsForKey(providedKey, env);
  if (!allowedBuildings.includes("*") && record.building && !allowedBuildings.includes(record.building)) {
    return jsonError("Submission not found.", 404);
  }

  const nextCount = Math.min(50, record.reportCount + increment);
  const updated = { ...record, reportCount: nextCount };
  await kv.put(`submission:${id}`, JSON.stringify(updated));
  const entry = createReportEntry(id);
  await kv.put(`report:${id}:${entry.id}`, JSON.stringify(entry), {
    expirationTtl: REPORT_ENTRY_TTL_SECONDS,
  });

  return jsonResponse({ reportCount: nextCount });
};
