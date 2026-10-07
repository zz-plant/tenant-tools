import type { APIRoute } from "astro";
import { guardApiRequest } from "../../../lib/api/requestGuard";
import { collectBuildingExport, toBuildingExportCsv } from "../../../lib/buildingData";
import { formatDate } from "../../../lib/dateUtils";
import { jsonError, jsonResponse } from "../../../lib/http";
import { getSubmissionsKv, hashBuildingId } from "../../../lib/storage/submissions";
import { validateBuildingId } from "../../../lib/validation";

export const prerender = false;

const fileSlug = (building: string) =>
  building.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "building";

/** Stewards download all of a building's records and dated facts, as JSON or CSV. */
export const GET: APIRoute = async ({ request, locals }) => {
  const kv = getSubmissionsKv(locals.runtime?.env ?? {});
  if (!kv) {
    return jsonError("Ledger storage is not configured.", 500);
  }

  const guarded = await guardApiRequest(request, locals, kv, {
    auth: { mode: "steward" },
    rateLimit: () => ({
      kv,
      keyPrefix: "rate:export",
      limit: 10,
      windowMs: 60_000,
      message: "Too many exports. Try again soon.",
    }),
    audit: { kv, action: "building.export", scope: "steward", logRejected: true },
  });
  if (!guarded.ok) {
    return guarded.response;
  }

  const building = validateBuildingId(guarded.context.url.searchParams.get("building"));
  if (!building.ok) {
    return jsonError(building.message, 400);
  }
  const format = guarded.context.url.searchParams.get("format") === "csv" ? "csv" : "json";

  const data = await collectBuildingExport(kv, building.building);
  await guarded.context.logAuditSuccess(await hashBuildingId(building.building));

  const filename = `building-ledger-${fileSlug(building.building)}-${formatDate(new Date())}.${format}`;
  const headers = {
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "no-store",
  };
  if (format === "csv") {
    return new Response(toBuildingExportCsv(data), {
      headers: { "Content-Type": "text/csv; charset=utf-8", ...headers },
    });
  }
  return jsonResponse(data, 200, headers);
};
