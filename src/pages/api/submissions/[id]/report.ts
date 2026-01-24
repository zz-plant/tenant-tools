import type { APIRoute } from "astro";
import { createReportEntry, REPORT_ENTRY_TTL_SECONDS } from "../../../../lib/reports";
import { enforceRateLimit, getClientIp } from "../../../../lib/rateLimit";

export const prerender = false;

export const POST: APIRoute = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Submission id is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = await request.json().catch(() => ({}));
  const increment = typeof payload?.increment === "number" ? payload.increment : 1;
  if (!Number.isFinite(increment) || increment < 1 || increment > 5) {
    return new Response(JSON.stringify({ error: "Invalid increment." }), {
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
    key: `rate:report:${ip}`,
    limit: 4,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return new Response(JSON.stringify({ error: "Too many report updates. Try again soon." }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(rateLimit.retryAfter),
      },
    });
  }

  const record = (await kv.get(`submission:${id}`, { type: "json" })) as
    | {
        id: string;
        reportCount: number;
      }
    | null;

  if (!record) {
    return new Response(JSON.stringify({ error: "Submission not found." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const nextCount = Math.min(50, record.reportCount + increment);
  const updated = { ...record, reportCount: nextCount };
  await kv.put(`submission:${id}`, JSON.stringify(updated));
  const entry = createReportEntry(id);
  await kv.put(`report:${id}:${entry.id}`, JSON.stringify(entry), {
    expirationTtl: REPORT_ENTRY_TTL_SECONDS,
  });

  return new Response(JSON.stringify({ reportCount: nextCount }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
