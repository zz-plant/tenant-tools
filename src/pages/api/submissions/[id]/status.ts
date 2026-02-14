import type { APIRoute } from "astro";
import { guardApiRequest } from "../../../../lib/api/requestGuard";
import { updateSubmissionStatusRecord } from "../../../../lib/domain/submissions";
import { jsonError, jsonResponse } from "../../../../lib/http";
import { isSubmissionRecord, isValidSubmissionStatus, type SubmissionRecord } from "../../../../lib/submissions";
import { fetchSubmissionRecord, getSubmissionsKv, saveSubmissionRecord } from "../../../../lib/storage/submissions";

export const prerender = false;

type StatusPayload = { status: SubmissionRecord["status"] };

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
    auth: { mode: "steward" },
    parseBody: { fallback: {} as { status?: unknown } },
    validate: (payload) => {
      if (!isValidSubmissionStatus(payload.status)) {
        return { ok: false, message: "Status is invalid." };
      }
      return { ok: true, data: { status: payload.status } as StatusPayload };
    },
    rateLimit: () => ({
      kv,
      keyPrefix: "rate:status",
      limit: 10,
      windowMs: 60_000,
      message: "Too many status updates. Try again soon.",
    }),
    audit: {
      kv,
      action: "submission.status.update",
      scope: "steward",
      resourceIdFromContext: () => id,
      logRejected: true,
    },
  });

  if (!guarded.ok) {
    return guarded.response;
  }

  const record = await fetchSubmissionRecord<SubmissionRecord>(kv, id);
  if (!isSubmissionRecord(record)) {
    return jsonError("Submission not found.", 404);
  }

  const updated = updateSubmissionStatusRecord(record, guarded.context.payload.status);
  await saveSubmissionRecord(kv, updated);
  await guarded.context.logAuditSuccess(id);

  return jsonResponse({ status: updated.status });
};
