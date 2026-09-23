import type { APIRoute } from "astro";
import { isBuildingAllowed } from "../../../../../lib/access";
import { guardApiRequest } from "../../../../../lib/api/requestGuard";
import {
  allowedEvidenceTypes,
  detectImageType,
  stripImageMetadata,
  type EvidenceImageType,
} from "../../../../../lib/evidence/imageMetadata";
import { buildSignedEvidenceUrl } from "../../../../../lib/evidence/signing";
import { jsonError, jsonResponse } from "../../../../../lib/http";
import {
  getEvidenceConfig,
  listEvidenceRecords,
  MAX_EVIDENCE_BYTES,
  MAX_EVIDENCE_PER_RECORD,
  newEvidenceObjectKey,
  saveEvidenceRecord,
} from "../../../../../lib/storage/evidence";
import { fetchSubmissionRecord, getSubmissionsKv, saveSubmissionRecord } from "../../../../../lib/storage/submissions";

export const prerender = false;

const privateHeaders = { "Cache-Control": "private, no-store" };

/** Lists evidence for residents of the building, with short-lived signed links. */
export const GET: APIRoute = async ({ params, request, locals }) => {
  const id = params.id;
  const env = locals.runtime?.env ?? {};
  const kv = getSubmissionsKv(env);
  if (!id || !kv) {
    return jsonError("Submission not found.", 404);
  }
  const evidence = getEvidenceConfig(env);
  if (!evidence) {
    return jsonResponse({ enabled: false, items: [] }, 200, privateHeaders);
  }

  const guarded = await guardApiRequest(request, locals, kv, { auth: { mode: "resident" } });
  if (!guarded.ok) {
    return guarded.response;
  }
  const record = await fetchSubmissionRecord(kv, id);
  if (!record || !isBuildingAllowed(guarded.context.allowedBuildings, record.building)) {
    return jsonError("Submission not found.", 404);
  }

  const items = await Promise.all(
    (await listEvidenceRecords(kv, id)).map(async (item) => ({
      id: item.id,
      createdAt: item.createdAt,
      url: await buildSignedEvidenceUrl(evidence.signingKey, id, item.id),
    }))
  );
  return jsonResponse({ enabled: true, items }, 200, privateHeaders);
};

/** Uploads one photo. The request body is the raw image bytes. */
export const POST: APIRoute = async ({ params, request, locals }) => {
  const id = params.id;
  const env = locals.runtime?.env ?? {};
  const kv = getSubmissionsKv(env);
  if (!id || !kv) {
    return jsonError("Submission not found.", 404);
  }
  const evidence = getEvidenceConfig(env);
  if (!evidence) {
    return jsonError("Evidence upload is not set up for this site.", 503);
  }

  const guarded = await guardApiRequest(request, locals, kv, {
    auth: { mode: "resident" },
    rateLimit: () => ({
      kv,
      keyPrefix: "rate:evidence",
      limit: 6,
      windowMs: 10 * 60_000,
      message: "Too many uploads. Try again later.",
    }),
    audit: {
      kv,
      action: "evidence.upload",
      scope: "resident",
      resourceIdFromContext: () => id,
      logRejected: true,
    },
  });
  if (!guarded.ok) {
    return guarded.response;
  }

  const record = await fetchSubmissionRecord(kv, id);
  if (!record || !isBuildingAllowed(guarded.context.allowedBuildings, record.building)) {
    return jsonError("Submission not found.", 404);
  }
  if (record.mergedInto) {
    return jsonError("This record was merged. Add evidence to the main record.", 409);
  }

  const declaredType = (request.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!allowedEvidenceTypes.includes(declaredType as EvidenceImageType)) {
    return jsonError("Upload a JPEG or PNG photo.", 415);
  }
  const declaredLength = Number(request.headers.get("content-length") || "0");
  if (declaredLength > MAX_EVIDENCE_BYTES) {
    return jsonError("The photo is too large. The limit is 5 MB.", 413);
  }

  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.length === 0) {
    return jsonError("The photo is empty.", 400);
  }
  if (bytes.length > MAX_EVIDENCE_BYTES) {
    return jsonError("The photo is too large. The limit is 5 MB.", 413);
  }
  const detectedType = detectImageType(bytes);
  if (!detectedType || detectedType !== declaredType) {
    return jsonError("Upload a JPEG or PNG photo.", 415);
  }

  const existing = await listEvidenceRecords(kv, id);
  if (existing.length >= MAX_EVIDENCE_PER_RECORD) {
    return jsonError("This record already has the most photos allowed.", 409);
  }

  let cleaned: Uint8Array;
  try {
    cleaned = stripImageMetadata(bytes, detectedType);
  } catch {
    return jsonError("We could not read this photo. Try a different photo.", 400);
  }

  const objectKey = newEvidenceObjectKey();
  await evidence.bucket.put(objectKey, cleaned, { httpMetadata: { contentType: detectedType } });
  const evidenceRecord = {
    id: crypto.randomUUID(),
    submissionId: id,
    objectKey,
    contentType: detectedType,
    size: cleaned.length,
    createdAt: new Date().toISOString(),
  };
  await saveEvidenceRecord(kv, evidenceRecord);
  await saveSubmissionRecord(kv, { ...record, evidenceCount: existing.length + 1 });
  await guarded.context.logAuditSuccess(id);

  return jsonResponse({ id: evidenceRecord.id, evidenceCount: existing.length + 1 }, 201, privateHeaders);
};
