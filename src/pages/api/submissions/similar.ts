import type { APIRoute } from "astro";
import { issueOptions, zoneOptions } from "../../../data/noticeData";
import { isBuildingAccessValid, isResidentKeyRecognized } from "../../../lib/access";
import { jsonError, jsonResponse, getRequestKey } from "../../../lib/http";
import { isValidDateString } from "../../../lib/validation";
import { fetchSubmissionRecord, getSubmissionsKv, listSubmissionKeys } from "../../../lib/storage/submissions";

export const prerender = false;

const issueIds = new Set(issueOptions.map((issue) => issue.id));
const zoneIds = new Set(zoneOptions.map((zone) => zone.id));

const daysBetween = (left: string, right: string) => {
  const leftDate = new Date(left);
  const rightDate = new Date(right);
  return Math.abs((leftDate.getTime() - rightDate.getTime()) / (1000 * 60 * 60 * 24));
};

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const building = url.searchParams.get("building") || "";
  const issue = url.searchParams.get("issue") || "";
  const zone = url.searchParams.get("zone") || "";
  const startDate = url.searchParams.get("startDate") || "";
  const providedKey = getRequestKey(request, "x-building-key", "key", url);
  const windowDays = 21;

  if (!building || !issue || !issueIds.has(issue) || (zone && !zoneIds.has(zone))) {
    return jsonResponse({ matches: [] });
  }

  const env = locals.runtime?.env ?? {};
  if (!isResidentKeyRecognized(providedKey, env)) {
    return jsonError("Resident access is required.", 403, { matches: [] });
  }
  if (!isBuildingAccessValid(building, providedKey, env)) {
    return jsonError("This key does not match the building.", 403, { matches: [] });
  }

  const referenceDate = isValidDateString(startDate) ? startDate : "";
  const kv = getSubmissionsKv(env);
  if (!kv) {
    return jsonResponse({ matches: [] });
  }

  const matches: Array<{
    id: string;
    issueLabel: string;
    startDate: string;
    reportCount: number;
    zone?: string;
  }> = [];

  let cursor: string | undefined;
  do {
    const listResult = await listSubmissionKeys(kv, cursor, 50);
    cursor = listResult.list_complete ? undefined : listResult.cursor;

    for (const key of listResult.keys) {
      const record = (await fetchSubmissionRecord(kv, key.name.replace("submission:", ""))) as
        | {
            id: string;
            building: string;
            issue: string;
            issueLabel: string;
            startDate: string;
            reportCount: number;
            zone?: string;
          }
        | null;
      if (!record) {
        continue;
      }
      if (record.building !== building || record.issue !== issue) {
        continue;
      }
      if (zone && record.zone !== zone) {
        continue;
      }
      if (referenceDate && record.startDate && isValidDateString(record.startDate)) {
        if (daysBetween(referenceDate, record.startDate) > windowDays) {
          continue;
        }
      }

      matches.push({
        id: record.id,
        issueLabel: record.issueLabel,
        startDate: record.startDate,
        reportCount: record.reportCount,
        zone: record.zone,
      });
    }
  } while (cursor && matches.length < 5);

  matches.sort((a, b) => a.startDate.localeCompare(b.startDate));

  return jsonResponse({ matches });
};
