import type { APIRoute } from "astro";
import { isAccessKeyValid } from "../../../../lib/access";
import { enforceRateLimit, getClientIp } from "../../../../lib/rateLimit";
import { isValidSubmissionStatus } from "../../../../lib/submissions";

export const prerender = false;

export const POST: APIRoute = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Submission id is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const requiredKey = locals.runtime?.env?.STEWARD_KEY;
  const url = new URL(request.url);
  const providedKey = request.headers.get("x-steward-key") || url.searchParams.get("stewardKey");
  if (!isAccessKeyValid(providedKey, requiredKey)) {
    return new Response(JSON.stringify({ error: "Steward access is required." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = await request.json().catch(() => ({}));
  const status = payload?.status;
  if (!isValidSubmissionStatus(status)) {
    return new Response(JSON.stringify({ error: "Status is invalid." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const kv = locals.runtime?.env?.SUBMISSIONS_KV;
  if (!kv) {
    return new Response(JSON.stringify({ error: "Ledger storage is not configured." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ip = getClientIp(request);
  const rateLimit = await enforceRateLimit({
    kv,
    key: `rate:status:${ip}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return new Response(JSON.stringify({ error: "Too many status updates. Try again soon." }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(rateLimit.retryAfter),
      },
    });
  }

  const record = await kv.get(`submission:${id}`, { type: "json" });
  if (!record || typeof record !== "object") {
    return new Response(JSON.stringify({ error: "Submission not found." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const updated = { ...(record as Record<string, unknown>), status };
  await kv.put(`submission:${id}`, JSON.stringify(updated));

  return new Response(JSON.stringify({ status }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
