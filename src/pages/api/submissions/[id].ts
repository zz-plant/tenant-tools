import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Submission id is required." }), {
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

  const record = await kv.get(`submission:${id}`, { type: "json" });
  if (!record) {
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
