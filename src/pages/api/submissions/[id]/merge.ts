import type { APIRoute } from "astro";
import { guardApiRequest } from "../../../../lib/api/requestGuard";
import { mergeSubmissionRecords } from "../../../../lib/domain/submissions";
import { jsonError, jsonResponse } from "../../../../lib/http";
import {
  countReporterMarkers,
  fetchSubmissionRecord,
  getSubmissionsKv,
  saveSubmissionRecord,
} from "../../../../lib/storage/submissions";

export const prerender = false;

type MergePayload = { into: string };

const idPattern = /^[A-Za-z0-9-]{1,64}$/;

export const POST: APIRoute = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return jsonError("Submission id is required.", 400);
  }

  const kv = getSubmissionsKv(locals.runtime?.env ?? {});
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }

  const guarded = await guardApiRequest<{ into?: unknown }, MergePayload>(request, locals, kv, {
    auth: { mode: "steward" },
    parseBody: { fallback: {} },
    validate: (payload) => {
      if (typeof payload.into !== "string" || !idPattern.test(payload.into)) {
        return { ok: false, message: "Choose the main record." };
      }
      return { ok: true, data: { into: payload.into } };
    },
    rateLimit: () => ({
      kv,
      keyPrefix: "rate:merge",
      limit: 10,
      windowMs: 60_000,
      message: "Too many merges. Try again soon.",
    }),
    audit: {
      kv,
      action: "submission.merge",
      scope: "steward",
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

  const [source, target] = await Promise.all([
    fetchSubmissionRecord(kv, id),
    fetchSubmissionRecord(kv, payload.into),
  ]);
  if (!source || !target) {
    return jsonError("Submission not found.", 404);
  }

  const result = mergeSubmissionRecords(source, target, await countReporterMarkers(kv, target.id));
  if (!result.ok) {
    return jsonError(result.message, result.status);
  }

  await saveSubmissionRecord(kv, result.target);
  await saveSubmissionRecord(kv, result.source);
  await guarded.context.logAuditSuccess(id);

  return jsonResponse({
    mergedInto: result.target.id,
    reportCount: result.target.reportCount,
    status: result.source.status,
  });
};
