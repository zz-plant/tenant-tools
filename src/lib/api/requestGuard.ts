import { getBuildingIdsForKey, isAccessKeyValid, isBuildingAccessValid, isResidentKeyRecognized } from "../access";
import { createAuditEvent, type AuditEventAction } from "../audit";
import { getRequestKey, jsonError, parseJsonBody } from "../http";
import { enforceRateLimit, getClientIp } from "../rateLimit";
import { saveAuditEvent } from "../storage/audit";

export type GuardAuthMode = "none" | "resident" | "steward";

type GuardRateLimitConfig = {
  kv: KVNamespace;
  keyPrefix: string;
  limit: number;
  windowMs: number;
  message: string;
};

type GuardAuditConfig<TValidated> = {
  kv: KVNamespace;
  action: AuditEventAction;
  scope: "resident" | "steward" | "public";
  resourceIdFromContext?: (input: { payload: TValidated | null; url: URL }) => string | undefined;
  logRejected?: boolean;
};

type GuardConfig<TPayload, TValidated> = {
  auth?: {
    mode: GuardAuthMode;
    residentHeaderName?: string;
    residentQueryParam?: string;
    stewardHeaderName?: string;
    stewardQueryParam?: string;
    buildingScopeFrom?: (payload: TValidated | null, url: URL) => string | null;
  };
  parseBody?: {
    fallback: TPayload;
  };
  validate?: (payload: TPayload) =>
    | { ok: true; data: TValidated }
    | { ok: false; message: string; details?: Record<string, unknown> };
  rateLimit?: (context: { kv: KVNamespace; clientIp: string; payload: TValidated | null }) => GuardRateLimitConfig;
  audit?: GuardAuditConfig<TValidated>;
};

export type GuardSuccess<TValidated> = {
  request: Request;
  env: Record<string, unknown>;
  url: URL;
  payload: TValidated | null;
  residentKey: string | null;
  allowedBuildings: string[];
  clientIp: string;
  logAuditSuccess: (resourceId?: string) => Promise<void>;
};

const writeAudit = async (
  config: GuardAuditConfig<unknown> | undefined,
  outcome: "success" | "rejected",
  payload: unknown,
  url: URL,
  resourceId?: string
) => {
  if (!config) {
    return;
  }
  if (outcome === "rejected" && !config.logRejected) {
    return;
  }

  const inferredResourceId = resourceId ?? config.resourceIdFromContext?.({ payload, url });

  try {
    await saveAuditEvent(
      config.kv,
      createAuditEvent({
        action: config.action,
        outcome,
        resourceId: inferredResourceId,
        scope: config.scope,
      })
    );
  } catch {
    // Guard behavior must stay stable even when audit writes fail.
  }
};

export const guardApiRequest = async <TPayload = Record<string, unknown>, TValidated = TPayload>(
  request: Request,
  locals: { runtime?: { env?: Record<string, unknown> } } | undefined,
  kv: KVNamespace,
  config: GuardConfig<TPayload, TValidated>
): Promise<{ ok: true; context: GuardSuccess<TValidated> } | { ok: false; response: Response }> => {
  const env = (locals?.runtime?.env ?? {}) as Record<string, unknown>;
  const url = new URL(request.url);

  let payload: TValidated | null = null;

  if (config.parseBody) {
    const parsedBody = await parseJsonBody(request, config.parseBody.fallback);
    if (config.validate) {
      const validation = config.validate(parsedBody);
      if (!validation.ok) {
        await writeAudit(config.audit, "rejected", payload, url);
        return {
          ok: false,
          response: jsonError(validation.message, 400, validation.details ?? {}),
        };
      }
      payload = validation.data;
    } else {
      payload = parsedBody as unknown as TValidated;
    }
  }

  const authMode = config.auth?.mode ?? "none";
  const residentHeaderName = config.auth?.residentHeaderName ?? "x-building-key";
  const residentQueryParam = config.auth?.residentQueryParam ?? "key";
  const stewardHeaderName = config.auth?.stewardHeaderName ?? "x-steward-key";
  const stewardQueryParam = config.auth?.stewardQueryParam ?? "stewardKey";

  let residentKey: string | null = null;
  let allowedBuildings: string[] = [];

  if (authMode === "resident") {
    residentKey = getRequestKey(request, residentHeaderName, residentQueryParam, url);
    if (!isResidentKeyRecognized(residentKey, env)) {
      await writeAudit(config.audit, "rejected", payload, url);
      return { ok: false, response: jsonError("Resident access is required.", 403) };
    }
    allowedBuildings = getBuildingIdsForKey(residentKey, env);

    const scopedBuilding = config.auth?.buildingScopeFrom?.(payload, url) ?? null;
    if (scopedBuilding && !isBuildingAccessValid(scopedBuilding, residentKey, env)) {
      await writeAudit(config.audit, "rejected", payload, url);
      return { ok: false, response: jsonError("This key does not match the building.", 403) };
    }
  }

  if (authMode === "steward") {
    const requiredKey = typeof env.STEWARD_KEY === "string" ? env.STEWARD_KEY : "";
    const providedKey = getRequestKey(request, stewardHeaderName, stewardQueryParam, url);
    if (!isAccessKeyValid(providedKey, requiredKey)) {
      await writeAudit(config.audit, "rejected", payload, url);
      return { ok: false, response: jsonError("Steward access is required.", 403) };
    }
  }

  const clientIp = getClientIp(request);
  if (config.rateLimit) {
    const definition = config.rateLimit({ kv, clientIp, payload });
    const rateLimit = await enforceRateLimit({
      kv: definition.kv,
      key: `${definition.keyPrefix}:${clientIp}`,
      limit: definition.limit,
      windowMs: definition.windowMs,
    });
    if (!rateLimit.ok) {
      await writeAudit(config.audit, "rejected", payload, url);
      return {
        ok: false,
        response: jsonError(definition.message, 429, {}, { "Retry-After": String(rateLimit.retryAfter) }),
      };
    }
  }

  return {
    ok: true,
    context: {
      request,
      env,
      url,
      payload,
      residentKey,
      allowedBuildings,
      clientIp,
      logAuditSuccess: async (resourceId) => writeAudit(config.audit, "success", payload, url, resourceId),
    },
  };
};
