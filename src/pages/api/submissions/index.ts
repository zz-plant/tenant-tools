import type { APIRoute } from "astro";
import { guardApiRequest } from "../../../lib/api/requestGuard";
import { createSubmissionRecord } from "../../../lib/domain/submissions";
import { jsonError, jsonResponse } from "../../../lib/http";
import { validateSubmissionInput } from "../../../lib/submissions";
import { getSubmissionsKv, saveSubmissionRecord } from "../../../lib/storage/submissions";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const kv = getSubmissionsKv(locals.runtime?.env ?? {});
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }

  const guarded = await guardApiRequest(request, locals, kv, {
    auth: {
      mode: "resident",
      buildingScopeFrom: (payload) => payload?.building ?? null,
    },
    parseBody: {
      fallback: null,
    },
    validate: (payload) => {
      const validation = validateSubmissionInput(payload);
      if (!validation.ok) {
        return {
          ok: false,
          message: "We could not save this submission.",
          details: { details: validation.errors },
        };
      }
      return { ok: true, data: validation.data };
    },
    rateLimit: () => ({
      kv,
      keyPrefix: "rate:submission",
      limit: 6,
      windowMs: 60_000,
      message: "Too many submissions. Try again soon.",
    }),
    audit: {
      kv,
      action: "submission.create",
      scope: "resident",
      logRejected: true,
    },
  });

  if (!guarded.ok) {
    return guarded.response;
  }

  const record = createSubmissionRecord(guarded.context.payload);
  await saveSubmissionRecord(kv, record);
  await guarded.context.logAuditSuccess(record.id);

  return jsonResponse({ id: record.id, url: `/submissions/${record.id}` }, 201);
};
