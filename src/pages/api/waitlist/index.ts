import type { APIRoute } from "astro";
import { enforceRateLimit, getClientIp } from "../../../lib/rateLimit";
import { validateWaitlistInput } from "../../../lib/waitlist";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const payload = await request.json().catch(() => null);
  const validation = validateWaitlistInput(payload);

  if (!validation.ok) {
    return new Response(
      JSON.stringify({
        error: "We could not save this waitlist request.",
        details: validation.errors,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const kv = locals.runtime?.env?.WAITLIST_KV;
  if (!kv) {
    return new Response(JSON.stringify({ error: "Waitlist storage is not configured." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ip = getClientIp(request);
  const rateLimit = await enforceRateLimit({
    kv,
    key: `rate:waitlist:${ip}`,
    limit: 4,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return new Response(JSON.stringify({ error: "Too many waitlist requests. Try again soon." }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(rateLimit.retryAfter),
      },
    });
  }

  const record = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...validation.data,
  };

  await kv.put(`waitlist:${record.id}`, JSON.stringify(record));

  return new Response(JSON.stringify({ id: record.id }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
