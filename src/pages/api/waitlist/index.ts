import type { APIRoute } from "astro";
import { enforceRateLimit, getClientIp } from "../../../lib/rateLimit";
import { validateWaitlistInput } from "../../../lib/waitlist";
import { jsonError, jsonResponse, parseJsonBody } from "../../../lib/http";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const payload = await parseJsonBody(request, null);
  const validation = validateWaitlistInput(payload);

  if (!validation.ok) {
    return jsonError("We could not save this waitlist request.", 400, { details: validation.errors });
  }

  const kv = locals.runtime?.env?.WAITLIST_KV;
  if (!kv) {
    return jsonError("Waitlist storage is not configured.", 500);
  }

  const ip = getClientIp(request);
  const rateLimit = await enforceRateLimit({
    kv,
    key: `rate:waitlist:${ip}`,
    limit: 4,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return jsonError(
      "Too many waitlist requests. Try again soon.",
      429,
      {},
      { "Retry-After": String(rateLimit.retryAfter) }
    );
  }

  const record = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...validation.data,
  };

  await kv.put(`waitlist:${record.id}`, JSON.stringify(record));

  return jsonResponse({ id: record.id }, 201);
};
