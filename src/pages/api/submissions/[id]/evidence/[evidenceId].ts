import type { APIRoute } from "astro";
import { isBuildingAllowed } from "../../../../../lib/access";
import { guardApiRequest } from "../../../../../lib/api/requestGuard";
import { verifyEvidenceSignature } from "../../../../../lib/evidence/signing";
import { jsonError, jsonResponse } from "../../../../../lib/http";
import {
  deleteEvidenceRecord,
  fetchEvidenceRecord,
  getEvidenceConfig,
  listEvidenceRecords,
} from "../../../../../lib/storage/evidence";
import { fetchSubmissionRecord, getSubmissionsKv, saveSubmissionRecord } from "../../../../../lib/storage/submissions";

export const prerender = false;

/**
 * Serves one evidence photo. Needs both a valid, unexpired signature and the resident key for the
 * building. A leaked link alone does not open the photo, and it stops working after a few minutes.
 */
export const GET: APIRoute = async ({ params, request, locals }) => {
  const { id, evidenceId } = params;
  const env = locals.runtime?.env ?? {};
  const kv = getSubmissionsKv(env);
  const evidence = getEvidenceConfig(env);
  if (!id || !evidenceId || !kv || !evidence) {
    return jsonError("Not found.", 404);
  }

  const url = new URL(request.url);
  const validSignature = await verifyEvidenceSignature(
    evidence.signingKey,
    id,
    evidenceId,
    url.searchParams.get("exp"),
    url.searchParams.get("sig")
  );
  if (!validSignature) {
    return jsonError("This link expired. Open the record again.", 403);
  }

  const guarded = await guardApiRequest(request, locals, kv, { auth: { mode: "resident" } });
  if (!guarded.ok) {
    return guarded.response;
  }
  const record = await fetchSubmissionRecord(kv, id);
  if (!record || !isBuildingAllowed(guarded.context.allowedBuildings, record.building)) {
    return jsonError("Not found.", 404);
  }

  const evidenceRecord = await fetchEvidenceRecord(kv, id, evidenceId);
  const object = evidenceRecord ? await evidence.bucket.get(evidenceRecord.objectKey) : null;
  if (!evidenceRecord || !object) {
    return jsonError("Not found.", 404);
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": evidenceRecord.contentType,
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Referrer-Policy": "no-referrer",
    },
  });
};

/** Steward housekeeping: remove a photo that shows faces, names, or other unsafe content. */
export const DELETE: APIRoute = async ({ params, request, locals }) => {
  const { id, evidenceId } = params;
  const env = locals.runtime?.env ?? {};
  const kv = getSubmissionsKv(env);
  const evidence = getEvidenceConfig(env);
  if (!id || !evidenceId || !kv || !evidence) {
    return jsonError("Not found.", 404);
  }

  const guarded = await guardApiRequest(request, locals, kv, {
    auth: { mode: "steward" },
    rateLimit: () => ({
      kv,
      keyPrefix: "rate:evidence-delete",
      limit: 20,
      windowMs: 60_000,
      message: "Too many changes. Try again soon.",
    }),
    audit: {
      kv,
      action: "evidence.delete",
      scope: "steward",
      resourceIdFromContext: () => id,
      logRejected: true,
    },
  });
  if (!guarded.ok) {
    return guarded.response;
  }

  const evidenceRecord = await fetchEvidenceRecord(kv, id, evidenceId);
  if (!evidenceRecord) {
    return jsonError("Not found.", 404);
  }
  await evidence.bucket.delete(evidenceRecord.objectKey);
  await deleteEvidenceRecord(kv, id, evidenceId);

  const record = await fetchSubmissionRecord(kv, id);
  const remaining = (await listEvidenceRecords(kv, id)).filter((item) => item.id !== evidenceId).length;
  if (record) {
    await saveSubmissionRecord(kv, { ...record, evidenceCount: remaining });
  }
  await guarded.context.logAuditSuccess(id);

  return jsonResponse({ evidenceCount: remaining });
};
