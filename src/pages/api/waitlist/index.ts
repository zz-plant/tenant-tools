import type { APIRoute } from "astro";
import { guardApiRequest } from "../../../lib/api/requestGuard";
import { createWaitlistRecord } from "../../../lib/domain/waitlist";
import { jsonError, jsonResponse } from "../../../lib/http";
import { getWaitlistKv, saveWaitlistEntry } from "../../../lib/storage/waitlist";
import { validateWaitlistInput } from "../../../lib/waitlist";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const kv = getWaitlistKv(locals.runtime?.env ?? {});
  if (!kv) {
    return jsonError("Waitlist storage is not configured.", 500);
  }

  const guarded = await guardApiRequest(request, locals, kv, {
    parseBody: {
      fallback: null,
    },
    validate: (payload) => {
      const validation = validateWaitlistInput(payload);
      if (!validation.ok) {
        return {
          ok: false,
          message: "We could not save this waitlist request.",
          details: { details: validation.errors },
        };
      }
      return { ok: true, data: validation.data };
    },
    rateLimit: () => ({
      kv,
      keyPrefix: "rate:waitlist",
      limit: 4,
      windowMs: 60_000,
      message: "Too many waitlist requests. Try again soon.",
    }),
    audit: {
      kv,
      action: "waitlist.create",
      scope: "public",
      logRejected: true,
    },
  });

  if (!guarded.ok) {
    return guarded.response;
  }

  const record = createWaitlistRecord(guarded.context.payload);

  await saveWaitlistEntry(kv, record);
  await guarded.context.logAuditSuccess(record.id);

  return jsonResponse({ id: record.id }, 201);
};
