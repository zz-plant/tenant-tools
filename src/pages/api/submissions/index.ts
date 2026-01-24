import type { APIRoute } from "astro";
import { issueOptions } from "../../../data/noticeData";
import { enforceRateLimit, getClientIp } from "../../../lib/rateLimit";
import { validateSubmissionInput } from "../../../lib/submissions";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const payload = await request.json().catch(() => null);
  const validation = validateSubmissionInput(payload);

  if (!validation.ok) {
    return new Response(
      JSON.stringify({
        error: "We could not save this submission.",
        details: validation.errors,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const issueLabel = issueOptions.find((issue) => issue.id === validation.data.issue)?.label ?? validation.data.issue;
  const record = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "open",
    issueLabel,
    ...validation.data,
  };

  const kv = locals.runtime?.env?.SUBMISSIONS_KV;
  if (!kv) {
    return new Response(
      JSON.stringify({ error: "Ledger storage is not configured." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const ip = getClientIp(request);
  const rateLimit = await enforceRateLimit({
    kv,
    key: `rate:submission:${ip}`,
    limit: 6,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return new Response(JSON.stringify({ error: "Too many submissions. Try again soon." }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(rateLimit.retryAfter),
      },
    });
  }

  await kv.put(`submission:${record.id}`, JSON.stringify(record));

  return new Response(
    JSON.stringify({ id: record.id, url: `/submissions/${record.id}` }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
};
