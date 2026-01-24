import type { APIRoute } from "astro";
import { getBuildingIdsForKey, isResidentKeyRecognized } from "../../../lib/access";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals, request }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Submission id is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
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

  const kv = locals.runtime?.env?.SUBMISSIONS_KV;
  if (!kv) {
    return new Response(JSON.stringify({ error: "Ledger storage is not configured." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const record = await kv.get(`submission:${id}`, { type: "json" });
  if (!record) {
    return new Response(JSON.stringify({ error: "Submission not found." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const allowedBuildings = getBuildingIdsForKey(providedKey, env);
  const recordBuilding = typeof record === "object" && record ? String((record as Record<string, unknown>).building || "") : "";
  if (!allowedBuildings.includes("*") && recordBuilding && !allowedBuildings.includes(recordBuilding)) {
    return new Response(JSON.stringify({ error: "Submission not found." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(record), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
