import type { APIRoute } from "astro";
import { issueOptions } from "../../../data/noticeData";
import { enforceRateLimit, getClientIp } from "../../../lib/rateLimit";
import { validateSubmissionInput } from "../../../lib/submissions";
import { isBuildingAccessValid, isResidentKeyRecognized } from "../../../lib/access";

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

  const env = locals.runtime?.env ?? {};
  const url = new URL(request.url);
  const providedKey = request.headers.get("x-building-key") || url.searchParams.get("key");
  if (!isResidentKeyRecognized(providedKey, env)) {
    return new Response(JSON.stringify({ error: "Resident access is required." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!isBuildingAccessValid(validation.data.building, providedKey, env)) {
    return new Response(JSON.stringify({ error: "This key does not match the building." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
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

  const keyForUrl = typeof providedKey === "string" ? providedKey.trim() : "";
  const keyParam = keyForUrl ? `?key=${encodeURIComponent(keyForUrl)}` : "";
  return new Response(
    JSON.stringify({ id: record.id, url: `/submissions/${record.id}${keyParam}` }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
};
