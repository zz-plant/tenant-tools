import type { APIRoute } from "astro";
import { guardApiRequest } from "../../../../lib/api/requestGuard";
import { createSubmissionReportEntry, incrementSubmissionReportCount } from "../../../../lib/domain/submissions";
import { jsonError, jsonResponse } from "../../../../lib/http";
import { hashReporterSession, REPORT_ENTRY_TTL_SECONDS } from "../../../../lib/reports";
import type { SubmissionRecord } from "../../../../lib/submissions";
import { hasReporterMarker, saveReportEntry, saveReporterMarker } from "../../../../lib/storage/reports";
import { fetchSubmissionRecord, getSubmissionsKv, saveSubmissionRecord } from "../../../../lib/storage/submissions";

export const prerender = false;

type ReportPayload = { increment: number };

export const POST: APIRoute = async ({ params, request, locals }) => {
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
    parseBody: { fallback: {} as { increment?: number } },
    validate: (payload) => {
      const increment = typeof payload?.increment === "number" ? payload.increment : 1;
      if (!Number.isInteger(increment) || increment < 1 || increment > 5) {
        return { ok: false, message: "Invalid increment." };
      }
      return { ok: true, data: { increment } satisfies ReportPayload };
    },
    rateLimit: () => ({
      kv,
      keyPrefix: "rate:report",
      limit: 4,
      windowMs: 60_000,
      message: "Too many report updates. Try again soon.",
    }),
    audit: {
      kv,
      action: "submission.report.increment",
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

  const record = await fetchSubmissionRecord<SubmissionRecord>(kv, id);
  if (!record) {
    return jsonError("Submission not found.", 404);
  }

  const allowedBuildings = guarded.context.allowedBuildings;
  if (!allowedBuildings.includes("*") && record.building && !allowedBuildings.includes(record.building)) {
    return jsonError("Submission not found.", 404);
  }

  const sessionId = guarded.context.sessionId;
  if (!sessionId) {
    return jsonError("Open the building page first, then try again.", 400);
  }

  const reporterHash = await hashReporterSession(id, sessionId);
  if (await hasReporterMarker(kv, id, reporterHash)) {
    return jsonResponse({ reportCount: record.reportCount, alreadyReported: true });
  }

  const updated = incrementSubmissionReportCount(record, payload.increment);
  await saveSubmissionRecord(kv, updated);
  await saveReporterMarker(kv, id, reporterHash, { expirationTtl: REPORT_ENTRY_TTL_SECONDS });

  const entry = createSubmissionReportEntry(id);
  await saveReportEntry(kv, entry, { expirationTtl: REPORT_ENTRY_TTL_SECONDS });

  await guarded.context.logAuditSuccess(id);

  return jsonResponse({ reportCount: updated.reportCount, alreadyReported: false });
};
