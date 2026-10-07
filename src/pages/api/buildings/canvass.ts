import type { APIRoute } from "astro";
import { guardApiRequest } from "../../../lib/api/requestGuard";
import { validateCanvassInput, type CanvassInput } from "../../../lib/canvass";
import { formatDate } from "../../../lib/dateUtils";
import { jsonError, jsonResponse } from "../../../lib/http";
import { deleteCanvass, isCanvassId, listCanvasses, newCanvassId, saveCanvass } from "../../../lib/storage/canvass";
import { getSubmissionsKv, hashBuildingId } from "../../../lib/storage/submissions";
import { validateBuildingId } from "../../../lib/validation";

export const prerender = false;

type SavePayload = CanvassInput & { building: string };

/** Stewards save a canvass tally for a building. Counts only. */
export const POST: APIRoute = async ({ request, locals }) => {
  const kv = getSubmissionsKv(locals.runtime?.env ?? {});
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }
  const guarded = await guardApiRequest<Record<string, unknown>, SavePayload>(request, locals, kv, {
    auth: { mode: "steward" },
    parseBody: { fallback: {} },
    validate: (payload) => {
      const building = validateBuildingId(payload?.building);
      if (!building.ok) {
        return { ok: false, message: building.message };
      }
      const canvass = validateCanvassInput(payload, formatDate(new Date()));
      if (!canvass.ok) {
        return { ok: false, message: canvass.message };
      }
      return { ok: true, data: { building: building.building, ...canvass.data } };
    },
    rateLimit: () => ({
      kv,
      keyPrefix: "rate:canvass",
      limit: 10,
      windowMs: 60_000,
      message: "Too many saves. Try again soon.",
    }),
    audit: { kv, action: "building.canvass.save", scope: "steward", logRejected: true },
  });
  if (!guarded.ok) {
    return guarded.response;
  }
  const payload = guarded.context.payload;
  if (!payload) {
    return jsonError("Request body is invalid.", 400);
  }
  const { building, ...data } = payload;
  const canvass = { id: newCanvassId(), ...data };
  await saveCanvass(kv, building, canvass);
  await guarded.context.logAuditSuccess(await hashBuildingId(building));
  return jsonResponse({ canvass }, 201);
};

/** Stewards remove a canvass saved by mistake. */
export const DELETE: APIRoute = async ({ request, locals }) => {
  const kv = getSubmissionsKv(locals.runtime?.env ?? {});
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }
  const guarded = await guardApiRequest<Record<string, unknown>, { building: string; canvassId: string }>(request, locals, kv, {
    auth: { mode: "steward" },
    parseBody: { fallback: {} },
    validate: (payload) => {
      const building = validateBuildingId(payload?.building);
      if (!building.ok) {
        return { ok: false, message: building.message };
      }
      if (!isCanvassId(payload?.canvassId)) {
        return { ok: false, message: "Canvass id is invalid." };
      }
      return { ok: true, data: { building: building.building, canvassId: payload.canvassId } };
    },
    rateLimit: () => ({
      kv,
      keyPrefix: "rate:canvass",
      limit: 10,
      windowMs: 60_000,
      message: "Too many changes. Try again soon.",
    }),
    audit: { kv, action: "building.canvass.save", scope: "steward", logRejected: true },
  });
  if (!guarded.ok) {
    return guarded.response;
  }
  const payload = guarded.context.payload;
  if (!payload) {
    return jsonError("Request body is invalid.", 400);
  }
  const existing = await listCanvasses(kv, payload.building);
  if (!existing.some((canvass) => canvass.id === payload.canvassId)) {
    return jsonError("Canvass not found.", 404);
  }
  await deleteCanvass(kv, payload.building, payload.canvassId);
  await guarded.context.logAuditSuccess(await hashBuildingId(payload.building));
  return jsonResponse({ removed: payload.canvassId });
};
