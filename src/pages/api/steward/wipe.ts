import type { APIRoute } from "astro";
import { guardApiRequest } from "../../../lib/api/requestGuard";
import { wipeBuildingBatch } from "../../../lib/buildingData";
import { jsonError, jsonResponse } from "../../../lib/http";
import { getEvidenceConfig } from "../../../lib/storage/evidence";
import { getSubmissionsKv, hashBuildingId } from "../../../lib/storage/submissions";
import { validateBuildingId } from "../../../lib/validation";

export const prerender = false;

type WipePayload = { building: string };

/**
 * Emergency wipe of one building's records, facts, "me too" markers, and evidence.
 * The steward must type the building name exactly. Runs in batches: call until `remaining` is false.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env ?? {};
  const kv = getSubmissionsKv(env);
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }

  const guarded = await guardApiRequest<{ building?: unknown; confirm?: unknown }, WipePayload>(request, locals, kv, {
    auth: { mode: "steward" },
    parseBody: { fallback: {} },
    validate: (payload) => {
      const result = validateBuildingId(payload?.building);
      if (!result.ok) {
        return { ok: false, message: result.message };
      }
      if (payload?.confirm !== result.building) {
        return { ok: false, message: "Type the building name exactly to confirm." };
      }
      return { ok: true, data: { building: result.building } };
    },
    rateLimit: () => ({
      kv,
      keyPrefix: "rate:wipe",
      limit: 60,
      windowMs: 60_000,
      message: "Too many wipe steps. Wait a minute, then run the wipe again.",
    }),
    audit: { kv, action: "building.wipe", scope: "steward", logRejected: true },
  });
  if (!guarded.ok) {
    return guarded.response;
  }
  const building = guarded.context.payload?.building;
  if (!building) {
    return jsonError("Building is required.", 400);
  }

  const bucket = getEvidenceConfig(env)?.bucket ?? env.EVIDENCE_BUCKET ?? null;
  const result = await wipeBuildingBatch(kv, bucket, building);
  await guarded.context.logAuditSuccess(await hashBuildingId(building));

  return jsonResponse(result, 200, { "Cache-Control": "no-store" });
};
