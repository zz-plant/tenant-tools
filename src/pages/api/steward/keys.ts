import type { APIRoute } from "astro";
import { guardApiRequest } from "../../../lib/api/requestGuard";
import {
  generateBuildingKey,
  hashBuildingKey,
  loadKeyRegistry,
  saveKeyRegistry,
} from "../../../lib/access/registry";
import { jsonError, jsonResponse } from "../../../lib/http";
import { getSubmissionsKv, hashBuildingId } from "../../../lib/storage/submissions";
import { validateBuildingId } from "../../../lib/validation";

export const prerender = false;

type BuildingPayload = { building: string };

const validateBuilding = (payload: { building?: unknown } | null) => {
  const result = validateBuildingId(payload?.building);
  return result.ok
    ? ({ ok: true, data: { building: result.building } } as const)
    : ({ ok: false, message: result.message } as const);
};

/**
 * Stewards issue a new key for a building. The key is shown once and only its hash is stored.
 * Issuing a key again rotates it: the old key stops working.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const kv = getSubmissionsKv(locals.runtime?.env ?? {});
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }

  const guarded = await guardApiRequest<{ building?: unknown }, BuildingPayload>(request, locals, kv, {
    auth: { mode: "steward" },
    parseBody: { fallback: {} },
    validate: validateBuilding,
    rateLimit: () => ({
      kv,
      keyPrefix: "rate:key-issue",
      limit: 5,
      windowMs: 60_000,
      message: "Too many key changes. Try again soon.",
    }),
    audit: { kv, action: "building.key.issue", scope: "steward", logRejected: true },
  });
  if (!guarded.ok) {
    return guarded.response;
  }
  const building = guarded.context.payload?.building;
  if (!building) {
    return jsonError("Building is required.", 400);
  }

  const key = generateBuildingKey();
  const registry = await loadKeyRegistry(kv, { fresh: true });
  const issuedAt = new Date().toISOString();
  registry.buildings[building] = { hash: await hashBuildingKey(key), issuedAt };
  await saveKeyRegistry(kv, registry);
  await guarded.context.logAuditSuccess(await hashBuildingId(building));

  return jsonResponse({ building, key, issuedAt }, 201, { "Cache-Control": "no-store" });
};

/** Stewards remove a key issued here. The building goes back to its deploy-settings key, if any. */
export const DELETE: APIRoute = async ({ request, locals }) => {
  const kv = getSubmissionsKv(locals.runtime?.env ?? {});
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }

  const guarded = await guardApiRequest<{ building?: unknown }, BuildingPayload>(request, locals, kv, {
    auth: { mode: "steward" },
    parseBody: { fallback: {} },
    validate: validateBuilding,
    rateLimit: () => ({
      kv,
      keyPrefix: "rate:key-remove",
      limit: 5,
      windowMs: 60_000,
      message: "Too many key changes. Try again soon.",
    }),
    audit: { kv, action: "building.key.remove", scope: "steward", logRejected: true },
  });
  if (!guarded.ok) {
    return guarded.response;
  }
  const building = guarded.context.payload?.building;
  if (!building) {
    return jsonError("Building is required.", 400);
  }

  const registry = await loadKeyRegistry(kv, { fresh: true });
  if (!registry.buildings[building]) {
    return jsonError("This building has no key issued here.", 404);
  }
  delete registry.buildings[building];
  await saveKeyRegistry(kv, registry);
  await guarded.context.logAuditSuccess(await hashBuildingId(building));

  return jsonResponse({ building, removed: true });
};
